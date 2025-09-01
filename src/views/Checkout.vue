<template>
  <div class="h-full min-h-0 w-full flex flex-col overflow-hidden bg-gradient-to-br from-bg-warm via-bg-light to-primary/5">
    <!-- Top bar -->
    <div class="shrink-0 px-6 py-4 bg-white/90 backdrop-blur-sm border-b border-primary/20 shadow-sm">
      <div class="flex items-center justify-between gap-4">
        <button
          @click="goBackToCart"
          class="inline-flex items-center gap-3 rounded-2xl px-6 py-3 text-gray-700 bg-white hover:bg-gray-50 active:translate-y-[1px] text-base font-semibold shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200"
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

        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none">
              <path d="M3 7h18v10H3z" stroke="currentColor" stroke-width="1.5"/>
              <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5"/>
            </svg>
          </div>
          <h3 class="text-3xl font-extrabold text-text-warm tracking-tight">
            Checkout
          </h3>
        </div>

        <button
          @click="goHome"
          class="inline-flex items-center gap-3 rounded-2xl px-6 py-3 text-gray-700 bg-white hover:bg-gray-50 active:translate-y-[1px] text-base font-semibold shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200"
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
      <div class="max-w-4xl mx-auto px-6 py-6 space-y-8">
        <!-- Total -->
        <div
          class="rounded-3xl border border-primary/20 bg-white/90 backdrop-blur-sm shadow-xl p-6 md:p-8 transform hover:scale-[1.02] transition-all duration-300"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-gradient-to-r from-success to-food-green rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" stroke="currentColor" stroke-width="1.5"/>
                  <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="1.5"/>
                </svg>
              </div>
              <div>
                <div class="text-gray-600 text-lg font-medium">Total Payable</div>
                <div class="text-sm text-gray-500">Including taxes and fees</div>
              </div>
            </div>
            <div class="text-4xl md:text-5xl font-extrabold text-gray-900">
              {{ currency }}
              {{ getDecimalNumber(cartState?.totalPayableAmount, decimals) }}
            </div>
          </div>
        </div>

        <!-- Payment Methods -->
        <div
          class="rounded-3xl border border-accent/20 bg-white/90 backdrop-blur-sm shadow-xl p-6 md:p-8"
        >
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-10 bg-gradient-to-r from-accent to-warning rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none">
                <path d="M3 7h18v10H3z" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5"/>
              </svg>
            </div>
            <div>
              <h3 class="text-2xl font-bold text-text-warm">Payment Method</h3>
              <p class="text-text-muted">Choose your preferred payment option</p>
            </div>
          </div>

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
          class="w-full h-16 md:h-18 rounded-2xl px-6 text-white text-xl font-extrabold shadow disabled:opacity-60 disabled:cursor-not-allowed bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary-dark active:translate-y-[1px] transition-all duration-300"
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
import { ORDERSTATES, PAYMENTSTATUS } from "@/lib/constants";
import moment from "moment";
import getDecimalNumber from "@/lib/getDecimalNumber";
import PACKAGE_JSON from "../../package.json";

const store = useMainStore();
const $toast = useToast();
const router = useRouter();

const { addCashAmount, resetCart, clearCart, placeKioskOrder, pos_device, selectOrderType } =
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

/* Simplified kiosk order placement */
const placeOrder = async () => {
  if (disabledBtn.value) return;

  if (!show_confirmation.value) {
    show_confirmation.value = true;
    return;
  }

  disabledBtn.value = true;
  show_confirmation.value = false;

  // Basic validation
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

  // Debug customer object
  console.log('Selected customer:', selected_customer.value);
  console.log('Customer phone:', selected_customer.value?.phone);
  console.log('Customer name:', selected_customer.value?.name);
  
  if (!selected_customer.value) {
    console.log('No customer object found');
    $toast.open({
      type: "warning", 
      message: "Please enter your phone number first",
      position: "top",
      duration: 1000,
    });
    disabledBtn.value = false;
    // Navigate back to home to enter phone number
    router.push("/home");
    return;
  }

  if (!selected_customer.value.phone && !selected_customer.value.name) {
    console.log('Customer object missing both phone and name');
    $toast.open({
      type: "warning", 
      message: "Customer phone number is missing",
      position: "top",
      duration: 1000,
    });
    disabledBtn.value = false;
    // Navigate back to home to re-enter phone number
    router.push("/home");
    return;
  }

  try {
    const paymentInfo = {
      method: payment_method.value,
      brand: payment_brand.value
    };
    // Use phone if available, otherwise use name (which is the formatted phone)
    const customerPhone = selected_customer.value.phone || selected_customer.value.name;
    const result = await placeKioskOrder(customerPhone, paymentInfo);
    
    if (result.success) {
      // Clear cart first
      clearCart();
      
      // Trigger order confirmation screen with order details
      if (window.handleOrderComplete) {
        window.handleOrderComplete(result.orderNumber || result.ptid || result.invoice_num, result);
      } else {
        // Fallback: navigate to home and show success toast
        $toast.open({
          type: "success",
          message: "Order placed successfully!",
          position: "top",
          duration: 1500,
        });
        setTimeout(() => {
          router.push("/home");
        }, 1500);
      }
    } else {
      $toast.open({
        type: "error",
        message: result.message || "Failed to place order",
        position: "top",
        duration: 2000,
      });
    }
  } catch (e) {
    console.error("Checkout error:", e);
    $toast.open({
      type: "error",
      message: "Network error. Please try again.",
      position: "top",
      duration: 2000,
    });
  } finally {
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
