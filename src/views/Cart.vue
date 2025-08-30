<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "vue-toast-notification";
import { useMainStore } from "@/stores/main";
import { storeToRefs } from "pinia";
import getDecimalNumber from "@/lib/getDecimalNumber";

const router = useRouter();
const $toast = useToast();

const store = useMainStore();
const { clearCart, addToCart, removeFromCart } = store;
const { cartItems, cartState, settings } = storeToRefs(store);

const decimals = computed(
  () => settings.value?.pos_settings?.currency_decimals || 2
);
const currency = computed(
  () => settings.value?.merchant?.currency_code || "SAR"
);

function goHome() {
  router.push("/home");
}
function clearCartItems() {
  clearCart();
  $toast.open({
    type: "warning",
    message: "Cart Cleared!",
    position: "top",
    duration: 800,
  });
}
function goToCheckout() {
  if (cartItems.value?.length) {
    router.push("/checkout");
  } else {
    $toast.open({
      type: "error",
      message: "Please Add Items First",
      position: "top",
    });
  }
}

/** ---------- Item UI helpers ---------- */
function initialsOf(name) {
  if (!name) return "??";
  const parts = String(name).trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() || "").join("") || "??";
}
function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return Math.abs(h);
}
const palette = [
  ["#0ea5e9", "#38bdf8"], // sky
  ["#22c55e", "#4ade80"], // green
  ["#f59e0b", "#fbbf24"], // amber
  ["#a855f7", "#c084fc"], // purple
  ["#ef4444", "#f87171"], // red
  ["#06b6d4", "#22d3ee"], // cyan
  ["#10b981", "#34d399"], // emerald
];
function gradientFor(name) {
  const idx = hashString(name || "x") % palette.length;
  const [c1, c2] = palette[idx];
  return `linear-gradient(135deg, ${c1}, ${c2})`;
}

/** ---------- Quantity handlers ---------- */
function inc(item) {
  const add_quantity = (parseFloat(item.quantity) || 0) + 1;
  addToCart({
    ...item,
    add_quantity,
    quantity: add_quantity,
    selling_price: item.selling_price,
    totalPrice: add_quantity * (parseFloat(item.selling_price) || 0),
  });
}
function dec(item) {
  const q = parseFloat(item.quantity) || 0;
  const newQ = Math.max(0, q - 1);
  if (newQ === 0) {
    removeFromCart({ ...item, remove_quantity: 1 });
  } else {
    // some stores use remove for deltas; we’ll just set via addToCart with new quantity
    addToCart({
      ...item,
      add_quantity: newQ,
      quantity: newQ,
      selling_price: item.selling_price,
      totalPrice: newQ * (parseFloat(item.selling_price) || 0),
    });
  }
}
function removeLine(item) {
  // remove entire qty
  const q = parseFloat(item.quantity) || 0;
  if (q > 0) {
    removeFromCart({ ...item, remove_quantity: q });
  }
}
</script>

<template>
  <div class="h-full min-h-0 w-full flex flex-col overflow-hidden bg-white">
    <!-- Header -->
    <div class="shrink-0 px-4 py-3 border-b border-slate-200 bg-white">
      <div class="flex items-center justify-between">
        <button
          @click="goHome"
          class="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-slate-800 bg-slate-100 hover:bg-slate-200 active:translate-y-[1px] text-base font-semibold"
          title="Back to Home"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
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
          Home
        </button>

        <h3 class="text-2xl font-extrabold text-slate-900 tracking-tight">
          Your Cart
        </h3>

        <button
          @click="clearCartItems"
          class="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-white bg-rose-600 hover:bg-rose-700 active:translate-y-[1px] text-base font-semibold"
          title="Clear Cart"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-[20px] w-[20px]"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M3 6h18M8 6v12m8-12v12M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
          Clear
        </button>
      </div>
    </div>

    <!-- Items list (independent scroll) -->
    <div class="flex-1 min-h-0 overflow-y-auto px-3 py-3">
      <template v-if="cartItems?.length">
        <div class="grid gap-3">
          <!-- Modern line card -->
          <div
            v-for="ci in cartItems"
            :key="ci.id || ci.item_code || ci.name"
            class="rounded-2xl border border-slate-200 bg-white shadow-sm p-3 md:p-4 flex items-center gap-3"
          >
            <!-- Thumbnail -->
            <div class="shrink-0">
              <img
                v-if="ci.image_url || ci.image"
                :src="ci.image_url || ci.image"
                :alt="ci.name"
                class="h-14 w-14 md:h-16 md:w-16 rounded-xl object-cover ring-1 ring-black/5"
                @error="ci.image_url = null"
                loading="lazy"
                decoding="async"
              />
              <div
                v-else
                class="h-14 w-14 md:h-16 md:w-16 rounded-xl flex items-center justify-center text-white text-lg md:text-xl font-extrabold ring-1 ring-black/5"
                :style="{ background: gradientFor(ci.name) }"
              >
                {{ initialsOf(ci.name) }}
              </div>
            </div>

            <!-- Info -->
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-2">
                <div class="truncate">
                  <div
                    class="text-base md:text-lg font-bold text-slate-900 truncate"
                  >
                    {{ ci.name }}
                  </div>
                  <div class="text-xs md:text-sm text-slate-500">
                    {{ currency }}
                    {{ getDecimalNumber(ci.selling_price || 0, decimals) }} each
                  </div>
                </div>

                <!-- Remove -->
                <button
                  class="shrink-0 rounded-lg p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                  @click="removeLine(ci)"
                  title="Remove item"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-[20px] w-[20px]"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M6 6l12 12M6 18L18 6"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                    />
                  </svg>
                </button>
              </div>

              <!-- Quantity + Line total -->
              <div class="mt-3 flex items-center justify-between">
                <!-- Stepper -->
                <div
                  class="inline-flex items-stretch rounded-xl overflow-hidden ring-1 ring-slate-200"
                >
                  <button
                    @click="dec(ci)"
                    class="px-4 md:px-5 py-2 md:py-3 text-white text-lg font-bold active:translate-y-[1px] bg-slate-700 hover:bg-slate-800"
                    aria-label="Decrease"
                  >
                    –
                  </button>
                  <div
                    class="px-4 md:px-6 py-2 md:py-3 text-base md:text-lg font-extrabold text-slate-900 bg-white"
                  >
                    {{ getDecimalNumber(ci.quantity || 0, decimals) }}
                  </div>
                  <button
                    @click="inc(ci)"
                    class="px-4 md:px-5 py-2 md:py-3 text-white text-lg font-bold active:translate-y-[1px] bg-emerald-600 hover:bg-emerald-700"
                    aria-label="Increase"
                  >
                    +
                  </button>
                </div>

                <!-- Line total -->
                <div class="text-right">
                  <div class="text-xs md:text-sm text-slate-500">
                    Line Total
                  </div>
                  <div
                    class="text-lg md:text-2xl font-extrabold text-slate-900"
                  >
                    {{ currency }}
                    {{
                      getDecimalNumber(
                        parseFloat(ci.selling_price || 0) *
                          parseFloat(ci.quantity || 0) || 0,
                        decimals
                      )
                    }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- /card -->
        </div>
      </template>

      <div
        v-else
        class="flex h-full min-h-[240px] items-center justify-center text-center"
      >
        <div class="space-y-3">
          <div
            class="mx-auto size-20 rounded-3xl bg-gradient-to-br from-sky-200 to-emerald-200 flex items-center justify-center shadow-inner"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="size-10"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M4 7h16M6 7l1.2 9a2 2 0 0 0 2 1.8h5.6a2 2 0 0 0 2-1.8L18 7M9 7v-.5a3.5 3.5 0 1 1 7 0V7"
                stroke="currentColor"
                stroke-width="1.5"
              />
            </svg>
          </div>
          <div class="text-slate-700 text-lg font-semibold">Cart is empty</div>
          <p class="text-sm text-slate-500">
            Add some tasty items to get started.
          </p>
        </div>
      </div>
    </div>

    <!-- Sticky totals + CTA -->
    <div
      class="shrink-0 sticky bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-200"
    >
      <div class="px-4 pt-3">
        <div class="grid grid-cols-12 items-center py-1">
          <div class="col-span-6 text-[13px] text-slate-600">Subtotal</div>
          <div
            class="col-span-6 text-right text-[13px] font-semibold text-slate-800"
          >
            {{ getDecimalNumber(cartState?.totalAmount, decimals) }}
          </div>
        </div>
        <div class="grid grid-cols-12 items-center py-1">
          <div class="col-span-6 text-[13px] text-slate-600">Tax</div>
          <div
            class="col-span-6 text-right text-[13px] font-semibold text-slate-800"
          >
            {{ getDecimalNumber(cartState?.tax, decimals) }}
          </div>
        </div>
        <div
          class="mt-1 pt-2 border-t border-slate-200 grid grid-cols-12 items-center"
        >
          <div class="col-span-6 text-base md:text-lg font-bold text-slate-900">
            Total
          </div>
          <div
            class="col-span-6 text-right text-xl md:text-3xl font-extrabold text-slate-900"
          >
            {{ currency }}
            {{ getDecimalNumber(cartState?.totalPayableAmount, decimals) }}
          </div>
        </div>
      </div>

      <div class="px-4 py-3">
        <button
          @click="goToCheckout"
          class="w-full h-14 md:h-16 rounded-2xl px-6 text-white text-lg md:text-xl font-extrabold shadow bg-sky-600 hover:bg-sky-700 active:bg-sky-800 active:translate-y-[1px]"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  </div>
</template>
