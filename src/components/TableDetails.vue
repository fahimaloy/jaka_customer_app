<template>
  <div class="p-4 pb-60 h-full overflow-y-scroll">
    <div
      v-for="(order, index) in selectedTable?.tableOrder || []"
      :key="order.order_id || index"
      class="mb-4"
    >
      <div class="bg-white rounded shadow p-4 relative">
        <div class="flex justify-between items-start mb-2">
          <div class="flex-1 cursor-pointer" @click.stop="toggleOrder(index)">
            <div class="font-bold text-sm">
              #SL.{{ index + 1 }} | #{{ selectedTable?.id }}
            </div>
            <div class="text-xs text-gray-500">
              Items {{ order?.orderitems?.length }} | Total
              {{ getDecimalNumber(order?.totalPayableAmount) }}
            </div>
            <div class="text-xs text-gray-500">
              {{ formatTimestamp(order.time) }}
            </div>
          </div>

          <div v-if="editingOrderIndex !== index">
            <button
              @click.stop="startEditing(index)"
              class="bg-blue-700 text-white px-3 py-1 rounded text-xs"
            >
              Edit
            </button>
          </div>
          <div v-else class="flex gap-2">
            <button
              @click.stop="saveChanges"
              class="bg-primary text-white px-3 py-1 rounded text-xs"
            >
              Save
            </button>
            <button
              @click.stop="cancelEditing"
              class="bg-red-700 text-white px-3 py-1 rounded text-xs"
            >
              Cancel
            </button>
          </div>
        </div>

        <div
          @click.stop="toggleOrder(index)"
          class="absolute -bottom-3 left-1/2 transform -translate-x-1/2 cursor-pointer"
        >
          <div
            class="bg-gray-200 rounded-full p-1.5 flex items-center justify-center"
          >
            <unicon
              :name="openOrderIndex === index ? 'angle-up' : 'angle-down'"
              fill="gray"
              :height="18"
              :width="18"
            />
          </div>
        </div>
      </div>

      <div
        v-if="openOrderIndex === index || editingOrderIndex === index"
        class="mt-6"
      >
        <div class="bg-gray-100 p-4 rounded shadow">
          <div
            v-for="(item, idx) in order.orderitems"
            :key="idx"
            class="mb-2 flex justify-between items-center"
            :class="[
              idx == order?.orderitems?.length - 1 ? '' : 'border-b pb-2',
              isItemMarkedForDeletion(item) ? 'opacity-50' : '',
            ]"
          >
            <div>
              <div class="text-xs font-semibold">{{ item.name }}</div>
              <div class="text-xxs text-gray-600">
                Price: {{ getDecimalNumber(item?.selling_price) }} | Quantity:
                x{{ getDecimalNumber(item?.quantity) }}
                | Total:
                {{ getDecimalNumber(item?.totalPrice) }}
              </div>
            </div>
            <button
              v-if="editingOrderIndex === index"
              @click.stop="toggleItemDeletion(item)"
              class="bg-red-700 text-white px-2 py-1 rounded text-xs"
            >
              <unicon
                :height="20"
                :width="20"
                name="trash-alt"
                fill="white"
              ></unicon>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom fixed buttons -->
    <div class="fixed bottom-14 left-0 right-0">
      <div class="bg-white font-semibold shadow-lg rounded-lg p-4 flex gap-4">
        <!-- <button
          @click="
            () => {
              showClearModal = true;
            }
          "
          class="flex-1 bg-red-700 text-white py-2 w-fit rounded-md text-xxs hover:bg-red-800 transition-colors"
        >
          Clear
        </button> -->
        <button
          @click="addAnotherOrder"
          class="flex-1 bg-gray-200 text-gray-800 py-2 rounded-md text-xxs hover:bg-gray-300 transition-colors"
        >
          Add Another Order
        </button>
        <button
          @click="handleReadyToBill"
          class="flex-1 bg-primary text-white py-2 rounded-md text-xxs hover:bg-primary-dark transition-colors"
        >
          Ready To Bill
        </button>
      </div>
    </div>

    <Confirmation
      v-if="showConfirmModal || showClearModal"
      :message="
        showConfirmModal
          ? `Are you sure you want to remove ${deletedItems.length} items?`
          : `Are you sure you want to clear the table?`
      "
      @proceed="handleProceed"
      @cancel="
        () => {
          showConfirmModal = false;
          showClearModal = false;
        }
      "
    />
  </div>
</template>

<script setup>
import { ref, onBeforeUnmount } from "vue";
import getDecimalNumber from "../lib/getDecimalNumber";
import { storeToRefs } from "pinia";
import { useMainStore } from "../stores/main";
import moment from "moment";
import { useRoute, useRouter } from "vue-router";
import Confirmation from "./Confirmation.vue";
import { useToast } from "vue-toast-notification";
const store = useMainStore();
const { selectedTable } = storeToRefs(store);
const { setSelectedTable, clearTable } = store;
const router = useRouter();
const forceStopReset = ref(false);
onBeforeUnmount(() => {
  if (!forceStopReset.value) {
    setSelectedTable(null);
  }
});
const $toast = useToast();
const $emit = defineEmits(["back"]);
const openOrderIndex = ref(null);
const editingOrderIndex = ref(null);
const deletedItems = ref([]);
const showConfirmModal = ref(false);
const showClearModal = ref(false);
const selectedOrderIndex = ref(null);
// Add new order handler
function addAnotherOrder() {
  forceStopReset.value = true;
  router.push("/home");
}

// Ready to bill handler
function handleReadyToBill() {
  forceStopReset.value = true;
  store.tableReadyToBill();
  router.push("/cart");
}

// Rest of the existing functions remain the same
function toggleOrder(index) {
  openOrderIndex.value = openOrderIndex.value === index ? null : index;
}

function startEditing(index) {
  editingOrderIndex.value = index;
  selectedOrderIndex.value = index;
  deletedItems.value = [];
  openOrderIndex.value = index;
}

function cancelEditing() {
  editingOrderIndex.value = null;
  selectedOrderIndex.value = null;
  deletedItems.value = [];
  openOrderIndex.value = null;
}

function toggleItemDeletion(item) {
  const index = deletedItems.value.findIndex((i) => i.id === item.id);
  if (index === -1) {
    deletedItems.value.push({ ...item });
  } else {
    deletedItems.value.splice(index, 1);
  }
}

function isItemMarkedForDeletion(item) {
  return deletedItems.value.some((i) => i.id === item.id);
}

function saveChanges() {
  showConfirmModal.value = true;
}

function handleProceed() {
  if (showConfirmModal.value) {
    if (selectedOrderIndex.value !== null) {
      store.updateTableOrderHistory(
        selectedOrderIndex.value,
        deletedItems.value
      );
    }
    cancelEditing();
  } else if (showClearModal.value) {
    clearTable({ table: selectedTable.value });
    router.push("/tables");
    $emit("back");
    $toast.info("Table has been cleared!", {
      position: "top",
      duration: 800,
    });
  }
  showConfirmModal.value = false;
}

function formatTimestamp(timestamp) {
  return moment(timestamp).format("YYYY-MM-DD HH:mm");
}
</script>
