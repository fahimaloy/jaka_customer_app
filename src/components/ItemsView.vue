<!-- src/components/ItemsView.vue -->

<script setup>
import { useMainStore } from "@/stores/main";
import SingleItem from "./SingleItem.vue";
import KeyboardModal from "./KeyboardModal.vue";
import { onMounted, ref, watch, computed, nextTick } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { useToast } from "vue-toast-notification";
import getDecimalNumber from "@/lib/getDecimalNumber";

const store = useMainStore();
const { filterItems, addToCart, clearCart, searchItems } = store;
const { filteredItems, cartItems, cartState, selectedCategoryId, settings } =
  storeToRefs(store);

onMounted(() => {
  console.log("settings: ", settings.value);
});
const router = useRouter();
const $toast = useToast();

const q = ref("");
const isSearching = ref(false);
const showSearchKeyboard = ref(false);

// debounce
let t;
function debounce(fn, ms = 250) {
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

onMounted(async () => {
  filterItems();
});

watch(selectedCategoryId, () => {
  filterItems();
});

const applyFilter = debounce(async () => {
  isSearching.value = true;
  await nextTick();
  
  // Use searchItems if there's a query, otherwise use filterItems
  if (q.value && q.value.trim()) {
    await searchItems(q.value.trim());
  } else {
    await filterItems();
  }
  
  isSearching.value = false;
}, 250);

watch(q, () => applyFilter());

const clearCartItems = () => {
  clearCart();
  $toast.open({
    type: "warning",
    message: "Cart Cleared!",
    position: "top",
    duration: 800,
  });
};

const currency = computed(
  () => settings.value?.merchant?.currency_code || "SAR"
);
const currencyDecimals = computed(
  () => settings.value?.pos_settings?.currency_decimals ?? 2
);

const ItemsQtyCount = computed(() => {
  const count = cartItems.value?.reduce(
    (total, value) => total + parseFloat(value?.quantity || 0),
    0
  );
  return count ? getDecimalNumber(count, currencyDecimals.value) : 0;
});

const cartTotal = computed(() => {
  const total =
    cartItems.value?.reduce((sum, it) => {
      const line =
        typeof it.totalPrice === "number"
          ? it.totalPrice
          : parseFloat(it.selling_price || 0) * parseFloat(it.quantity || 0);
      return sum + (isFinite(line) ? line : 0);
    }, 0) || 0;

  return getDecimalNumber(total, currencyDecimals.value);
});

function goToCart() {
  router.push({ name: "cart" }).catch(() => router.push("/cart"));
}
</script>

<template>
  <!-- Make this component its own flex column with a single scroll area -->
  <div class="relative h-full w-full flex flex-col overflow-hidden">
    <!-- Enhanced bg pattern -->
    <div
      class="pointer-events-none absolute inset-0 -z-10 opacity-[0.08]"
      style="
        background: repeating-linear-gradient(
          135deg,
          #FF6B35 0px,
          #FF6B35 8px,
          #FFB52A 8px,
          #FFB52A 16px,
          #FF4757 16px,
          #FF4757 24px,
          #6C5CE7 24px,
          #6C5CE7 32px
        );
      "
    />

    <!-- Enhanced Sticky header -->
    <div
      class="shrink-0 sticky top-0 z-10 bg-gradient-to-b from-bg-warm/95 to-white/90 backdrop-blur-xl px-3 pt-2 pb-3 border-b border-primary/20 shadow-sm"
    >
      <div class="flex items-center gap-2">
        <div class="flex-1">
          <label class="relative block">
            <input
              v-model="q"
              @focus="showSearchKeyboard = true"
              type="text"
              placeholder="Search dishes, codes, notes…"
              class="w-full rounded-xl border border-primary/30 bg-white/90 backdrop-blur-sm px-3 py-2.5 text-sm outline-none shadow-sm focus:ring-2 focus:ring-primary/50 focus:border-primary/60 transition-all duration-200"
              readonly
            />
            <span
              v-if="isSearching"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400"
            >
              searching…
            </span>
          </label>
        </div>

        <button
          class="shrink-0 rounded-full px-3 py-2 text-xs font-semibold text-white bg-gradient-to-r from-danger to-danger hover:from-danger hover:to-secondary-dark active:scale-95 transition-all duration-200 shadow-md"
          @click="clearCartItems"
          title="Clear cart"
        >
          Clear
        </button>
      </div>

      <div class="mt-1.5 text-[11px] text-slate-500">
        {{ filteredItems?.length || 0 }} items
        <span v-if="ItemsQtyCount > 0" class="mx-1">•</span>
        <span v-if="ItemsQtyCount > 0">in cart: {{ ItemsQtyCount }}</span>
      </div>
    </div>

    <!-- Scroll area -->
    <div class="flex-1 min-h-0 overflow-y-auto px-2 pb-40 pt-2">
      <div
        v-if="filteredItems?.length"
        class="grid gap-2.5 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6"
      >
        <SingleItem
          v-for="item in filteredItems"
          :key="item.id || item.item_code || item.name"
          :item="item"
        />
      </div>

      <div
        v-else
        class="flex flex-col items-center justify-center gap-3 text-center py-16"
      >
        <div
          class="size-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shadow-lg border border-primary/30"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="size-8 text-primary"
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
        <div class="text-text-warm font-bold text-lg">No delicious items match</div>
        <p class="text-sm text-text-muted">
          🔍 Try another category or adjust your search.
        </p>
      </div>
    </div>

    <!-- Floating Cart CTA -->
    <div
      v-if="Number(ItemsQtyCount) > 0"
      class="fixed inset-x-0 md:bottom-4 bottom-4 z-50 px-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.25rem)] pointer-events-none"
    >
      <!-- Enhanced backdrop card -->
      <div
        class="mx-auto w-full max-w-md rounded-2xl bg-overlay-light backdrop-blur-xl shadow-2xl ring-1 ring-white/20 pointer-events-auto border border-primary/20"
      >
        <button
          @click="goToCart"
          class="w-full rounded-xl px-4 py-4 text-white text-lg font-extrabold shadow-lg active:translate-y-[1px] transition-all duration-200 bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary-dark active:scale-95 transform hover:scale-105"
        >
          {{ currency }} {{ cartTotal }} • {{ ItemsQtyCount }} item<span
            v-if="ItemsQtyCount != 1"
            >s</span
          >
          → Checkout
        </button>
      </div>
    </div>
    
    <!-- Search Keyboard Modal -->
    <KeyboardModal
      v-if="showSearchKeyboard"
      v-model:value="q"
      @close="showSearchKeyboard = false"
      title="Search Items"
      placeholder="Search dishes, codes, notes..."
    />
  </div>
</template>

<style scoped>
@keyframes cartGlow {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>
