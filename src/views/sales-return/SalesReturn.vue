<template>
  <div class="h-full pb-3 flex flex-col bg-custom-dgrey text-white">
    <!-- Tabs -->
    <div class="flex">
      <button
        @click="activeTab = 'original'"
        :class="tabClass(activeTab === 'original')"
      >
        Original
      </button>
      <button
        @click="activeTab = 'details'"
        :class="tabClass(activeTab === 'details')"
      >
        Details
      </button>
      <button
        @click="activeTab = 'refund'"
        :class="tabClass(activeTab === 'refund')"
      >
        Refund
      </button>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto">
      <!-- Original Cart -->
      <Cart
        v-if="activeTab === 'original'"
        title="Original Cart"
        :items="originalItems"
        :cartState="returnCartState"
        side="left"
        :settings="mainStore.settings"
        @move-item="moveItemFromOriginal"
        @clear="clearOriginal"
        @full-invoice-refund="fullInvoiceRefund"
      />

      <!-- Details Tab: Search bar + OrderDetails -->
      <div v-if="activeTab === 'details'">
        <!-- Search Bar -->
        <div
          class="w-full border-b pb-4 flex flex-wrap items-center gap-2 p-1 px-4"
        >
          <select
            v-model="searchType"
            class="px-3 py-2 border rounded bg-white text-custom-dgrey"
          >
            <option value="id">Order ID</option>
            <option value="invoice">Invoice No</option>
          </select>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search Order..."
            class="flex-grow px-3 py-2 border rounded text-black"
          />
          <button
            @click="downloadOrder()"
            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Get
          </button>
        </div>

        <!-- Order Details -->
        <OrderDetails
          :order="mainStore.returnOrder"
          @add-customer="addCustomerToExisting"
        />
      </div>

      <!-- Refund Cart -->
      <Cart
        v-if="activeTab === 'refund'"
        title="Refund Cart"
        side="right"
        :items="refundedItems"
        :cartState="refundCartState"
        :settings="mainStore.settings"
        :isRefundFormVisible="showRefundForm"
        :refundReason="refundReason"
        :note="note"
        :refundMethod="refundMethod"
        :refundLoading="refundLoading"
        @move-item="moveItemFromRefunded"
        @clear="clearRefunded"
        @checkout="openRefundForm"
        @back="showRefundForm = false"
        @confirm="handleRefundConfirm"
        @reason-change="(val) => (refundReason = val)"
        @note-change="(val) => (note = val)"
        @method-change="(val) => (refundMethod = val)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from "vue";
import { addOrder, updateOrder, getSingleOrder } from "@/lib/db/orders";
import axios from "axios";
import Cart from "./components/Cart.vue";
import OrderDetails from "./components/OrderDetails.vue";
import { useMainStore } from "@/stores/main";

const mainStore = useMainStore();

// Tabs
const activeTab = ref("details");
const tabClass = (isActive) =>
  [
    "flex-1",
    "py-2",
    "text-center",
    isActive ? "bg-primary text-white font-semibold" : "bg-gray-700",
  ].join(" ");

// Search state
const searchType = ref("id");
const searchQuery = ref("");

// Cart state
const originalItems = ref([]);
const refundedItems = ref([]);
const returnCartState = ref({});
const refundCartState = ref({});
const showRefundForm = ref(false);
const refundReason = ref("RETURNED");
const note = ref("");
const refundMethod = ref("CASH");
const refundLoading = ref(false);

// Helpers to recalc totals
function recalcTotals(items, outRef) {
  let total = 0,
    tax = 0,
    discount = 0;
  items.forEach((i) => {
    total += (i.price + i.single_qty_tax) * i.quantity;
    tax += i.single_qty_tax * i.quantity;
    discount += +(i.discount || 0);
  });
  outRef.value = {
    totalAmount: total,
    tax,
    discount,
    totalPayableAmount: total,
    charge: mainStore.returnOrder?.charges?.amount || 0,
  };
}

// Sync totals
watch(originalItems, (items) => recalcTotals(items, returnCartState), {
  immediate: true,
});
watch(refundedItems, (items) => recalcTotals(items, refundCartState), {
  immediate: true,
});

// When order downloads, set originalItems
watch(
  () => mainStore.returnOrder,
  (order) => {
    if (!order?.orderitems) return;
    originalItems.value = order.orderitems.map((i) => ({
      ...i,
      name: i.item_name,
      selling_price: i.adjusted_unit_price,
      single_qty_tax: i.tax_amount / i.quantity,
      price: i.taxable_amount / i.quantity,
      id: i.item,
    }));
    refundedItems.value = [];
  },
  { immediate: true }
);

// Barcode buffer
let barcodeBuffer = "";
function onKeyPress(e) {
  if (e.key === "Enter") {
    const code = barcodeBuffer.trim();
    barcodeBuffer = "";
    const item = originalItems.value.find((i) => i.item_code === code);
    if (item) moveItemFromOriginal(item.id);
  } else {
    barcodeBuffer += e.key;
  }
}
onMounted(() => window.addEventListener("keypress", onKeyPress));
onUnmounted(() => window.removeEventListener("keypress", onKeyPress));

// Move items
function moveItemFromOriginal(id, qty = 1) {
  const idx = originalItems.value.findIndex((i) => i.id === id);
  if (idx < 0) return;
  const itm = originalItems.value[idx];
  const take = Math.min(qty, itm.quantity);
  itm.quantity -= take;
  if (!itm.quantity) originalItems.value.splice(idx, 1);
  const ridx = refundedItems.value.findIndex((i) => i.id === id);
  if (ridx >= 0) refundedItems.value[ridx].quantity += take;
  else refundedItems.value.push({ ...itm, quantity: take });
}
function moveItemFromRefunded(id, qty = 1) {
  const idx = refundedItems.value.findIndex((i) => i.id === id);
  if (idx < 0) return;
  const itm = refundedItems.value[idx];
  const take = Math.min(qty, itm.quantity);
  itm.quantity -= take;
  if (!itm.quantity) refundedItems.value.splice(idx, 1);
  const oidx = originalItems.value.findIndex((i) => i.id === id);
  if (oidx >= 0) originalItems.value[oidx].quantity += take;
  else originalItems.value.push({ ...itm, quantity: take });
}

// Clears
function clearOriginal() {
  originalItems.value = [];
  refundedItems.value = [];
  mainStore.returnOrder = null;
  activeTab.value = "original";
}
function clearRefunded() {
  refundedItems.value = [];
  originalItems.value =
    mainStore.returnOrder?.orderitems?.map((i) => ({
      ...i,
      quantity: i.quantity,
    })) || [];
}

// Refund form
function openRefundForm() {
  if (!navigator.onLine) return alert("Please connect to the internet");
  showRefundForm.value = true;
}

// *** COMPLETE handleRefundConfirm ***
async function handleRefundConfirm() {
  // 1. validate note
  if (
    mainStore.settings.pos_settings.refund_note_mandatory &&
    (!note.value || note.value.trim().length < 5)
  ) {
    return alert("Please type a reason (min 5 chars).");
  }

  refundLoading.value = true;
  const time = Date.now();

  // 2. prepare items_to_refund
  const items_to_refund = refundedItems.value.map((el) => {
    const obj = { ...el };
    obj.tax = obj.single_qty_tax * obj.quantity;
    obj.totalPrice = (obj.selling_price + obj.single_qty_tax) * obj.quantity;
    obj.totalAmount = obj.totalPrice;
    return obj;
  });

  // 3. payload
  const payload = {
    refund_reason: refundReason.value,
    note: note.value,
    refund_method: refundMethod.value,
    items: items_to_refund,
    orderDetails: mainStore.returnOrder,
    totalRefund: refundCartState.value.totalPayableAmount,
    pos_device: mainStore.settings.pos_device,
    refund_items: items_to_refund,
    invoice_num: mainStore.returnOrder.invoice_num,
    refund_ptid: `${mainStore.settings.pos_device.id || ""}-${time}`,
    unique_id: mainStore.returnOrder.id,
    charge_amount: mainStore.returnOrder.charges?.amount,
    charge_name: mainStore.returnOrder.charges?.name,
    order_id: mainStore.returnOrder.id,
    shift_id: mainStore.shiftUser.id,
  };

  try {
    // 4. API call
    const response = await axios.post(
      `${mainStore.baseURL}/refund-order`,
      {
        refundPayload: payload,
        user_id: mainStore.shiftUser.location_user_id,
        username: mainStore.shiftUser.username,
      },
      { headers: { Authorization: mainStore.token } }
    );

    const data = response.data;

    // 5. clone & update order
    const newOrder = { ...mainStore.returnOrder };
    newOrder.orderitems = originalItems.value;
    newOrder.cartState = returnCartState.value;
    newOrder.refund_details = data.details;
    newOrder.refunded = true;

    // 6. check local
    const localCheck = await getSingleOrder(newOrder.ptid);
    if (localCheck.success) {
      const existing = localCheck.result;
      Object.assign(existing, {
        orderitems: originalItems.value,
        cartState: returnCartState.value,
        refunded: true,
        refunded_items: refundedItems.value,
        refund_details: data.details,
        is_synced: 1,
        downloaded: false,
      });
      await updateOrder(existing);
    } else {
      newOrder.downloaded = true;
      await addOrder(newOrder);
    }

    // 7. user feedback & reset
    alert("Refund Successful");
    mainStore.returnOrder = null;
    originalItems.value = [];
    refundedItems.value = [];
    showRefundForm.value = false;
  } catch (err) {
    alert("Refund Failed: " + (err.response?.data?.message || err.message));
  } finally {
    refundLoading.value = false;
  }
}

// Full invoice refund
function fullInvoiceRefund() {
  if (!mainStore.returnOrder || !originalItems.value.length) {
    return alert("Nothing to refund.");
  }
  originalItems.value.forEach((i) => moveItemFromOriginal(i.id, i.quantity));
}

// Add Customer
function addCustomerToExisting(order) {
  mainStore.addCustomer({ ...order, redirect: "sales-return" });
}

// ——— SEARCH + DOWNLOAD ORDER ———
async function downloadOrder(providedID = null) {
  originalItems.value = [];
  refundedItems.value = [];
  mainStore.returnOrder = null;

  if (!searchQuery.value && !providedID) return;

  const payload = {
    user_id: mainStore.shiftUser.location_user_id,
    username: mainStore.shiftUser.username,
  };
  if (providedID) {
    payload.order_id = parseInt(providedID);
  } else if (searchType.value === "id") {
    payload.order_id = parseInt(searchQuery.value);
  } else {
    payload.invoice_num = searchQuery.value;
  }

  try {
    const resp = await axios.post(`${mainStore.baseURL}/get-order`, payload, {
      headers: { Authorization: mainStore.token },
    });
    if (!resp.data.success) {
      return alert(resp.data.message || "Error downloading order");
    }
    mainStore.returnOrder = resp.data.order;
    searchQuery.value = "";
    alert(resp.data.message || "Successfully downloaded order");
  } catch (e) {
    alert(e.response?.data?.error || e.message || "Error downloading order");
  }
}
</script>

<style scoped>
.bg-custom-dgrey {
  background: #2d2d2d;
}
.text-custom-dgrey {
  color: #333;
}
</style>
