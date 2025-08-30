<template>
  <!-- Item Card -->
  <div
    @click="openModal"
    class="group relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 select-none"
    :class="[
      cartMatch ? 'ring-2 ring-primary shadow-xl' : 'shadow-md hover:shadow-lg',
      'bg-white active:translate-y-[1px]',
    ]"
  >
    <!-- Hover splash from top-right -->
    <span
      class="pointer-events-none absolute -top-10 -right-10 size-24 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      :style="{ background: splashColor }"
    />

    <!-- Media -->
    <div class="relative aspect-[4/3] overflow-hidden bg-slate-50">
      <img
        v-if="hasImage"
        :src="imageSrc"
        :alt="item.name"
        class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.05]"
        loading="lazy"
        @error="imgError = true"
        decoding="async"
      />
      <!-- Fallback initials avatar -->
      <div
        v-else
        class="h-full w-full flex items-center justify-center text-white font-bold text-3xl"
        :style="{ background: avatarGradient }"
      >
        {{ initials }}
      </div>

      <!-- Quantity pill if in cart -->
      <div
        v-if="cartMatch?.quantity"
        class="absolute left-3 top-3 text-xs font-semibold bg-white/90 backdrop-blur px-2 py-1 rounded-full shadow"
      >
        In cart: {{ cartMatch.quantity }}
      </div>

      <!-- Corner price tag -->
      <div
        class="absolute bottom-0 right-0 m-2 px-2.5 py-1 rounded-full text-xs font-bold text-white shadow"
        :style="{ background: pricePillColor }"
      >
        {{ currency }}
        {{
          getDecimalNumber(
            cartMatch?.selling_price || item?.selling_price || 0,
            settings?.pos_settings?.currency_decimals || 2
          )
        }}
      </div>
    </div>

    <!-- Body -->
    <div class="p-3">
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0">
          <div
            class="text-sm font-extrabold tracking-wide text-slate-800 leading-5 line-clamp-2"
          >
            {{ item.name }}
          </div>

          <div
            v-if="settings?.pos_settings?.show_item_code_in_menu"
            class="text-[11px] text-slate-500 mt-0.5"
          >
            {{ item?.item_code }}
          </div>
        </div>

        <!-- Tiny status dot (fun accent) -->
        <span class="mt-0.5 inline-flex items-center justify-center">
          <span
            class="size-2.5 rounded-full"
            :style="{ background: dotColor }"
          ></span>
        </span>
      </div>

      <!-- Meta row: modifiers or tags preview if any -->
      <div v-if="item?.tags?.length" class="mt-2 flex flex-wrap gap-1">
        <span
          v-for="(t, i) in item.tags.slice(0, 3)"
          :key="i"
          class="px-2 py-0.5 rounded-full text-[10px] font-semibold text-white"
          :style="{ background: tagColors[i % tagColors.length] }"
        >
          {{ t }}
        </span>
        <span
          v-if="item.tags.length > 3"
          class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-200 text-slate-700"
        >
          +{{ item.tags.length - 3 }}
        </span>
      </div>
    </div>

    <!-- Ripple-like overlay to make it feel tappable -->
    <span
      class="absolute inset-0 rounded-xl ring-1 ring-black/5 pointer-events-none"
    />
  </div>

  <!-- Shared ItemModal -->
  <ItemModal :item="item" v-model:show="showModal" @added="handleAdd" />
</template>

<script setup>
import { ref, computed } from "vue";
import { useMainStore } from "@/stores/main";
import { storeToRefs } from "pinia";
import getDecimalNumber from "@/lib/getDecimalNumber";
import ItemModal from "./ItemModal.vue";

const props = defineProps({
  item: { type: Object, required: true },
});

// global store
const store = useMainStore();
const { cartItems, settings, locations, defaultLocation } = storeToRefs(store);
const { addToCart, removeFromCart } = store;

// modal visibility
const showModal = ref(false);

// find existing cart entry
const cartMatch = computed(
  () => cartItems.value.find((ci) => ci.id === props.item.id) || null
);

// tax inclusion flag
const is_tax_inclusive = computed(() =>
  defaultLocation.value
    ? locations.value.find((el) => el.id == defaultLocation.value)
        ?.is_tax_inclusive || false
    : (settings.value && settings.value.location?.is_tax_inclusive) || false
);

// currency
const currency = computed(
  () => settings.value?.merchant?.currency_code || "SAR"
);

// image handling
const imgError = ref(false);
const candidateImage =
  props.item?.image ||
  props.item?.image_url ||
  props.item?.photo ||
  props.item?.thumbnail ||
  null;

const hasImage = computed(() => !!candidateImage && !imgError.value);
const imageSrc = computed(() => candidateImage);

// initials fallback
const initials = computed(() => {
  const name = (props.item?.name || "").trim();
  if (!name) return "??";
  const parts = name.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("");
});

// fun color helpers
const palette = [
  ["#f97316", "#fb923c"], // orange
  ["#22c55e", "#4ade80"], // green
  ["#06b6d4", "#22d3ee"], // cyan
  ["#a855f7", "#c084fc"], // purple
  ["#ef4444", "#f87171"], // red
  ["#eab308", "#facc15"], // amber
  ["#0ea5e9", "#38bdf8"], // sky
];

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return Math.abs(h);
}
const colorIndex = computed(
  () => hash(props.item?.name || "x") % palette.length
);
const [c1, c2] = palette[colorIndex.value] || palette[0];

const avatarGradient = computed(() => `linear-gradient(135deg, ${c1}, ${c2})`);
const pricePillColor = computed(() => c1);
const dotColor = computed(() => c2);

// playful hover splash
const splashColor = computed(() => c2 + "55");

// optional tag colors for meta chips
const tagColors = [
  "#0ea5e9", // sky
  "#f59e0b", // amber
  "#10b981", // emerald
  "#a855f7", // purple
  "#ef4444", // red
];

// open the modal
function openModal() {
  showModal.value = true;
}

// handle payload from ItemModal
function handleAdd({
  quantity,
  selling_price,
  totalPrice,
  modifiers,
  notes,
  selected_unit,
}) {
  const existingQty = cartMatch.value?.quantity || 0;
  const delta = quantity - existingQty;

  const payload = {
    ...props.item,
    quantity,
    selling_price,
    totalPrice,
    modifiers,
    is_tax_inclusive: is_tax_inclusive.value,
    notes,
    selected_unit,
  };

  if (delta > 0) {
    addToCart({ ...payload, add_quantity: quantity });
  } else if (delta < 0) {
    removeFromCart({ ...payload, remove_quantity: quantity });
  }
}
</script>

<style scoped>
/* Make line-clamp work without relying on Tailwind plugin environments */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
