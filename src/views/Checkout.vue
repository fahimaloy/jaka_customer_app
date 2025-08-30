<template>
  <div class="h-full min-h-0 w-full flex flex-col overflow-hidden bg-white">
    <!-- Top bar -->
    <div class="shrink-0 px-4 py-3 border-b border-slate-200 bg-white">
      <div class="flex items-center justify-between gap-2">
        <button
          @click="goBackToCart"
          class="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-slate-800 bg-slate-100 hover:bg-slate-200 active:translate-y-[1px] text-base font-semibold"
          title="Back to Cart"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-[20px] w-[20px]"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M15 19l-7-7 7-7"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          Cart
        </button>

        <h3 class="text-2xl font-extrabold text-slate-900 tracking-tight">
          Checkout
        </h3>

        <button
          @click="goHome"
          class="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-slate-800 bg-slate-100 hover:bg-slate-200 active:translate-y-[1px] text-base font-semibold"
          title="Back to Home"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-[20px] w-[20px]"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M3 12l9-9 9 9"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M9 21V9h6v12"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          Home
        </button>
      </div>
    </div>

    <!-- Body (scrolls if needed) -->
    <div class="flex-1 min-h-0 overflow-y-auto">
      <div class="max-w-3xl mx-auto px-4 py-4 md:py-6 space-y-6">
        <!-- Total -->
        <div
          class="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 md:p-6"
        >
          <div class="flex items-center justify-between">
            <div class="text-slate-600 text-base">Total Payable</div>
            <div class="text-3xl md:text-4xl font-extrabold text-slate-900">
              {{ currency }}
              {{ getDecimalNumber(cartState?.totalPayableAmount, decimals) }}
            </div>
          </div>
        </div>

        <!-- Payment Methods -->
        <div
          class="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 md:p-6"
        >
          <div class="text-slate-900 font-bold mb-3">Select Payment Method</div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <!-- Visa -->
            <button
              class="pay-card"
              :class="isSelected('CARD', 'VISA') ? 'pay-card--active' : ''"
              @click="selectPayment('CARD', 'VISA')"
            >
              <div class="pay-logo visa">VISA</div>
            </button>

            <!-- MasterCard -->
            <button
              class="pay-card"
              :class="
                isSelected('CARD', 'MASTERCARD') ? 'pay-card--active' : ''
              "
              @click="selectPayment('CARD', 'MASTERCARD')"
            >
              <div class="pay-logo mastercard">
                <span class="mc-left"></span><span class="mc-right"></span>
              </div>
              <div class="pay-text">MasterCard</div>
            </button>

            <!-- Amex -->
            <button
              class="pay-card"
              :class="isSelected('CARD', 'AMEX') ? 'pay-card--active' : ''"
              @click="selectPayment('CARD', 'AMEX')"
            >
              <div class="pay-logo amex">AMEX</div>
            </button>

            <!-- COD (Cash) -->
            <button
              class="pay-card"
              :class="isSelected('CASH', 'COD') ? 'pay-card--active' : ''"
              @click="selectPayment('CASH', 'COD')"
            >
              <div class="pay-logo cod">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-[28px] w-[28px]"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M3 7h18v10H3z"
                    stroke="currentColor"
                    stroke-width="1.5"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                    stroke="currentColor"
                    stroke-width="1.5"
                  />
                </svg>
              </div>
              <div class="pay-text">COD</div>
            </button>
          </div>
        </div>

        <!-- Notes -->
        <div
          class="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 md:p-6"
        >
          <label class="block text-slate-900 font-bold mb-2">Notes</label>
          <textarea
            v-model="notes"
            class="w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-sky-300"
            rows="3"
            placeholder="Add any special instructions…"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- Sticky actions -->
    <div
      class="shrink-0 sticky bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-200"
    >
      <div class="max-w-3xl mx-auto px-4 py-3 md:py-4">
        <button
          :disabled="disabledBtn || !payment_method"
          @click="placeOrder"
          class="w-full h-16 md:h-18 rounded-2xl px-6 text-white text-xl font-extrabold shadow disabled:opacity-60 disabled:cursor-not-allowed bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 active:translate-y-[1px]"
        >
          {{ disabledBtn ? "Placing Order..." : "Place Order" }}
        </button>
      </div>
    </div>

    <!-- Confirmation -->
    <Alert
      v-if="show_confirmation"
      title="Confirm Order?"
      @submit="placeOrder"
      @close="show_confirmation = false"
      :message="`Total: ${getDecimalNumber(
        cartState?.totalPayableAmount,
        decimals
      )} ${currency}, Payment: ${prettyPaymentLabel}`"
    />
  </div>
</template>

<script setup>
import { useMainStore } from "@/stores/main";
import { storeToRefs } from "pinia";
import { computed, ref, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "vue-toast-notification";
import Alert from "../components/Alert.vue";
import { ORDERSTATES, PAYMENTSTATUS } from "@/lib/conf";
import moment from "moment";
import getDecimalNumber from "@/lib/getDecimalNumber";
import PACKAGE_JSON from "../../package.json";

const store = useMainStore();
const $toast = useToast();
const router = useRouter();

const { addCashAmount, resetCart, addOrder, pos_device, selectOrderType } =
  store;

const {
  cartItems,
  settings,
  cartState,
  selected_order_type,
  shiftUser,
  user_data,
  selectedTable,
  selected_customer,
  pos_login_type,
} = storeToRefs(store);

/* ====== Simplified: only total, payment, notes ====== */
const decimals = computed(
  () => settings.value?.pos_settings?.currency_decimals || 2
);
const currency = computed(
  () => settings.value?.merchant?.currency_code || "SAR"
);

const show_confirmation = ref(false);
const disabledBtn = ref(false);
const notes = ref("");

/* Payment method state:
   - payment_method: what your order code expects ("CASH" or "CARD")
   - payment_brand: visual label ("VISA", "MASTERCARD", "AMEX", "COD")
*/
const payment_method = ref(null);
const payment_brand = ref(null);

const prettyPaymentLabel = computed(() => {
  if (payment_method.value === "CASH") return "COD (Cash)";
  if (payment_method.value === "CARD") return payment_brand.value || "Card";
  return "—";
});

/* Select payment card. For CARD brands we set method = 'CARD'.
   For COD we set method = 'CASH' and auto-tender full amount. */
function selectPayment(method, brand) {
  payment_method.value = method;
  payment_brand.value = brand;

  // Auto-fill tendered amount for CASH so validation passes with no extra UI
  if (method === "CASH") {
    addCashAmount(
      Number(
        getDecimalNumber(
          cartState.value?.totalPayableAmount || 0,
          decimals.value
        )
      )
    );
  }
}

function isSelected(method, brand) {
  return payment_method.value === method && payment_brand.value === brand;
}

/* ——— The rest is your original order logic, lightly adjusted ——— */
const order_types = computed(() =>
  pos_login_type.value
    ? settings.value?.price_categories?.length
      ? [...settings.value?.price_categories].sort(
          (a, b) => a.position - b.position
        )
      : []
    : [{ id: "carhop", name: "Carhop" }]
);
const selectedType = computed(() =>
  pos_login_type.value
    ? selected_order_type.value && settings.value?.price_categories?.length
      ? settings.value.price_categories.find(
          (item) => item.id == selected_order_type.value
        )
      : null
    : { id: "carhop", name: "Carhop" }
);

onMounted(() => {
  if (!pos_login_type.value) {
    selectOrderType("carhop");
  } else if (order_types.value?.length) {
    selectOrderType(order_types.value[0].id);
  }
});

/* Navigation */
const goBackToCart = () => router.push("/cart");
const goHome = () => router.push("/home");

/* Generate token / invoice helpers from your original */
function generateTokenCounter(
  lastResetDateTime,
  currentDateTime,
  cardIntegration = false
) {
  const print_settings = settings.value?.print_settings;
  let count = localStorage.getItem("LTNC") || 0;
  count = typeof count == "string" ? parseInt(count) : count;
  if (count == 0) {
    count = print_settings?.order_starting_number
      ? parseInt(print_settings.order_starting_number) - 1
      : 0;
  }
  if (!lastResetDateTime) {
    const time = currentDateTime.getTime();
    if (!cardIntegration) localStorage.setItem("LTNRT", time);
    count++;
    if (!cardIntegration) localStorage.setItem("LTNC", count);
    return count;
  }
  const timeString =
    settings.value?.pos_settings?.late_night_business_end_time || "00:00:00";
  const current = new Date();
  const currentHour = current.getHours();
  const [resetHour] = timeString.split(":").map(Number);

  if (print_settings?.reset_order_number_daily) {
    if (
      new Date(lastResetDateTime).getDate() !==
      new Date(currentDateTime).getDate()
    ) {
      if (currentHour < resetHour) {
        count++;
        if (!cardIntegration) localStorage.setItem("LTNC", count);
        return count;
      } else {
        const time = currentDateTime.getTime();
        if (!cardIntegration) {
          localStorage.setItem("LTNRT", time);
          localStorage.setItem(
            "LTNC",
            print_settings?.order_starting_number
              ? print_settings.order_starting_number
              : 1
          );
        }
        return print_settings?.order_starting_number
          ? print_settings.order_starting_number
          : 1;
      }
    }
  }
  count++;
  if (!cardIntegration) localStorage.setItem("LTNC", count);
  return count;
}
const getInvoicePrefix = (prefix) => {
  if (prefix)
    return prefix[prefix.length - 1] == "-"
      ? prefix.toString()
      : prefix.toString() + "-";
  return "";
};

/* Place order (kept, with UI flow simplified) */
const placeOrder = async () => {
  if (disabledBtn.value) return;

  if (!show_confirmation.value) {
    show_confirmation.value = true;
    return;
  }

  disabledBtn.value = true;
  show_confirmation.value = false;

  // Minimal validations
  if (pos_login_type.value && !payment_method.value) {
    $toast.open({
      type: "warning",
      message: "Select Payment Method",
      position: "top",
      duration: 500,
    });
    disabledBtn.value = false;
    return;
  }
  if (pos_login_type.value && payment_method.value === "CASH") {
    // ensure tendered covers total
    if (
      !cartState.value?.amountTendered ||
      cartState.value.amountTendered < cartState.value.totalPayableAmount
    ) {
      $toast.open({
        type: "warning",
        message: "Tendered amount is less than total",
        position: "top",
        duration: 700,
      });
      disabledBtn.value = false;
      return;
    }
  }
  if (!cartItems.value || cartItems.value.length === 0) {
    $toast.open({
      type: "warning",
      message: "Please add items to cart to place order",
      position: "top",
      duration: 700,
    });
    disabledBtn.value = false;
    return;
  }

  const time = new Date().getTime();
  let invoice_count = localStorage.getItem("invoice_count") || null;
  invoice_count = invoice_count ? parseInt(invoice_count) + 1 : 1;

  const LTNRT = localStorage.getItem("LTNRT") || null;
  const token_counter = generateTokenCounter(
    LTNRT ? new Date(parseInt(LTNRT)) : null,
    new Date(time)
  );

  const ptid = `${settings.value?.pos_device?.id || ""}-${time}`;

  // Map brand → method name in settings
  let desiredName =
    payment_method.value === "CARD"
      ? "CARD"
      : payment_method.value === "CASH"
      ? "CASH"
      : "Credit";

  let pmObj;
  if (settings.value?.payment_methods?.length) {
    pmObj = settings.value.payment_methods.find(
      (pm) => (pm.name || "").toUpperCase() === desiredName
    );
  }
  if (!pmObj) pmObj = { id: null, name: desiredName };

  const invoice_num = `${
    settings.value?.pos_device?.id || ""
  }-${moment().format("YYMMDD")}-${invoice_count}`;
  const invoicePrefix = settings?.pos_device?.invoice_prefix
    ? getInvoicePrefix(settings.value.pos_device.invoice_prefix)
    : "";

  const payload = {
    ptid,
    id: pos_login_type.value ? token_counter : invoice_num,
    shift_id: shiftUser.value?.id,
    time,
    invoice_num,
    jaka_pos_version: PACKAGE_JSON?.version,
    order_source: "Store",
    paymentMethod: pmObj.name.toUpperCase(),
    payment_method_id: pmObj.id,
    customer: selected_customer.value || undefined,
    store_id: settings.value?.merchant?.id,
    is_synced: 0,
    user: user_data.value,
    token_no: `${invoicePrefix}${token_counter}`,
    token_counter: `${invoicePrefix}${token_counter}`,
    table: selectedTable.value,
    cartState: { ...cartState.value, orderitems: cartItems.value },
    paymentStatus: PAYMENTSTATUS.PENDING,
    orderStatus: ORDERSTATES.PENDING,
    discount: cartState.value?.discount || 0.0,
    charges: 0,
    pos_device: settings.value?.pos_device,
    total: cartState.value.totalPayableAmount,
    notes: notes.value || null,
    // Keep a simple order type fallback
    type: selectedType.value,
    order_type: pos_login_type.value ? selectedType.value?.name : "carhop",
  };

  try {
    const data = await addOrder(payload);
    if (data && data?.message) {
      $toast.open({
        type: data?.success ? "success" : "error",
        message: data.message,
        position: "top",
        duration: 2000,
      });
    }
    if (data?.success) {
      resetCart();
      if (order_types.value.length) selectOrderType(order_types.value[0]?.id);
      router.push("/home");
    }
  } catch (e) {
    $toast.open({
      type: "error",
      message: e?.response?.data
        ? JSON.stringify(e.response.data)
        : "Some Error Occurred!",
      position: "top",
      duration: 2000,
    });
  } finally {
    localStorage.setItem("invoice_count", invoice_count);
    disabledBtn.value = false;
  }
};
</script>

<style scoped>
/* Payment cards */
.pay-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  height: 5.5rem;
  border-radius: 1rem;
  border: 1px solid #e2e8f0; /* slate-200 */
  background: white;
  transition: transform 0.06s ease, box-shadow 0.12s ease,
    border-color 0.12s ease;
}
.pay-card:hover {
  box-shadow: 0 6px 20px rgba(2, 6, 23, 0.06);
}
.pay-card--active {
  border-color: #0ea5e9;
  box-shadow: 0 8px 24px rgba(14, 165, 233, 0.18);
}

.pay-logo {
  font-weight: 900;
  letter-spacing: 0.5px;
}

.pay-logo.visa {
  color: #0a3aa3;
  font-size: 1.25rem;
}
.pay-logo.amex {
  color: white;
  background: #2e77bc;
  padding: 0.2rem 0.5rem;
  border-radius: 0.35rem;
  font-size: 1.05rem;
}

/* MasterCard overlapping circles + label */
.pay-logo.mastercard {
  position: relative;
  width: 50px;
  height: 28px;
  display: grid;
  place-items: center;
}
.pay-logo.mastercard .mc-left,
.pay-logo.mastercard .mc-right {
  position: absolute;
  width: 28px;
  height: 28px;
  border-radius: 50%;
}
.pay-logo.mastercard .mc-left {
  left: 6px;
  background: #ea001b;
}
.pay-logo.mastercard .mc-right {
  right: 6px;
  background: #ff9900;
}
.pay-text {
  font-size: 0.8rem;
  color: #334155; /* slate-700 */
}

.pay-logo.cod {
  color: #0f172a; /* slate-900 */
}

/* Accessibility focus ring */
.pay-card:focus-visible {
  outline: 3px solid rgba(14, 165, 233, 0.35);
  outline-offset: 2px;
}
</style>
