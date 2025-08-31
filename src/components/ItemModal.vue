<template>
  <teleport to="body" v-if="show">
    <transition name="fade">
      <!-- Overlay -->
      <div
        class="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        @keydown.esc="close"
      >
        <!-- Panel -->
        <div
          class="relative w-[92vw] max-w-lg max-h-[88vh] rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden"
          role="dialog"
          aria-modal="true"
        >
          <!-- Media header -->
          <div class="relative h-44 w-full bg-slate-100">
            <img
              v-if="hasImage"
              :src="imageSrc"
              :alt="item.name"
              class="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
              @error="imgError = true"
            />
            <div
              v-else
              class="h-full w-full flex items-center justify-center text-white font-extrabold text-4xl"
              :style="{ background: avatarGradient }"
            >
              {{ initials }}
            </div>

            <!-- Floating price pill -->
            <div
              class="absolute bottom-2 right-2 rounded-full px-3 py-1.5 text-xs font-bold text-white shadow"
              :style="{ background: pillColor }"
            >
              {{ currency }}
              {{ getDecimalNumber(sellingPrice || 0, decimals) }}
            </div>
          </div>

          <!-- Scrollable body -->
          <div
            class="max-h-[calc(88vh-56px-3.5rem)] overflow-y-auto px-4 sm:px-6 pt-4 pb-24"
          >
            <!-- Title -->
            <h3 class="text-xl font-bold text-slate-900 text-center leading-6">
              {{ item.name }}
            </h3>

            <!-- Meta chips -->
            <div
              class="mt-2 flex flex-wrap items-center justify-center gap-1.5 text-[11px]"
            >
              <span v-if="item?.item_code" class="chip"
                >Code: {{ item.item_code }}</span
              >
              <span v-if="item?.sku" class="chip">SKU: {{ item.sku }}</span>
              <span v-if="item?.tax_percent != null" class="chip">
                Tax:
                {{ getDecimalNumber(item.tax_percent, decimals) }}%
              </span>
              <span v-if="item?.buying_price != null" class="chip">
                Buying:
                {{ currency }}
                {{ getDecimalNumber(item.buying_price, decimals) }}
              </span>
              <span
                v-if="settings?.pos_settings?.show_cost && item?.wac != null"
                class="chip"
              >
                WAC:
                {{ currency }} {{ getDecimalNumber(item.wac, decimals) }}
              </span>
            </div>

            <!-- Controls: Price • Qty • Total -->
            <div class="mt-4 grid grid-cols-3 gap-3">
              <!-- Price -->
              <div class="control">
                <label class="label">Price</label>
                <input
                  disabled
                  type="number"
                  v-model.number="sellingPrice"
                  class="input text-center bg-gray-50 cursor-not-allowed"
                  min="0"
                  readonly
                />
                <div class="hint">locked</div>
              </div>

              <!-- Quantity stepper -->
              <div class="control">
                <label class="label">Qty</label>
                <div
                  class="flex items-stretch rounded-lg ring-1 ring-slate-200 overflow-hidden"
                >
                  <button
                    @click="decrement"
                    class="px-3 py-2 text-white text-lg font-bold active:translate-y-[1px]"
                    :style="{ background: dangerGradient }"
                    aria-label="Decrease"
                  >
                    –
                  </button>
                  <input
                    ref="quantityInput"
                    type="number"
                    v-model.number="quantity"
                    @focus="showNumpad = true"
                    class="w-full text-center px-2 py-2 outline-none focus:bg-primary/5"
                    min="1"
                    readonly
                  />
                  <button
                    @click="increment"
                    class="px-3 py-2 text-white text-lg font-bold active:translate-y-[1px]"
                    :style="{ background: pillColor }"
                    aria-label="Increase"
                  >
                    +
                  </button>
                </div>
              </div>

              <!-- Total -->
              <div class="control">
                <label class="label">Total</label>
                <input
                  type="number"
                  v-model.number="totalPrice"
                  @focus="showNumpad = true"
                  class="input text-center focus:bg-primary/5"
                  min="0"
                  readonly
                />
                <div class="hint">{{ currency }}</div>
              </div>
            </div>

            <!-- Units (cards) -->
            <div v-if="item.units?.length" class="mt-5">
              <h4 class="section-title">Units</h4>
              <div class="grid grid-cols-2 gap-2">
                <button
                  class="unit-card"
                  :class="!selectedUnit ? 'unit-selected' : ''"
                  @click="selectUnit(null)"
                >
                  Default • {{ currency }}
                  {{ getDecimalNumber(item.selling_price || 0, decimals) }}
                </button>

                <button
                  v-for="u in item.units"
                  :key="u.id"
                  class="unit-card"
                  :class="selectedUnit?.id === u.id ? 'unit-selected' : ''"
                  @click="selectUnit(u)"
                >
                  {{ u.unit_name }} • {{ currency }}
                  {{ getDecimalNumber(u.selling_price || 0, decimals) }}
                </button>
              </div>
            </div>

            <!-- Modifiers -->
            <div v-if="item.modifiers?.length" class="mt-5">
              <h4 class="section-title">Modifiers</h4>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="mod in item.modifiers"
                  :key="mod.name"
                  @click="toggleModifier(mod)"
                  class="px-3 py-1.5 rounded-full text-sm border transition active:translate-y-[1px]"
                  :class="
                    isSelected(mod)
                      ? 'text-white border-transparent'
                      : 'text-slate-700 border-slate-200 bg-white hover:bg-slate-50'
                  "
                  :style="isSelected(mod) ? { background: pillColor } : {}"
                >
                  <span class="font-semibold">{{ mod.name }}</span>
                  <span v-if="mod.additional_price" class="opacity-90">
                    &nbsp;• {{ currency }}
                    {{ getDecimalNumber(mod.additional_price, decimals) }}
                  </span>
                </button>
              </div>
            </div>

            <!-- Notes -->
            <div class="mt-5">
              <h4 class="section-title">Notes</h4>
              <textarea
                v-model="notes"
                @focus="showKeyboard = true"
                class="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-300"
                rows="2"
                placeholder="Add a note (e.g., extra spicy, no onions)…"
                readonly
              ></textarea>
            </div>
          </div>

          <!-- Sticky actions -->
          <div
            class="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-100 px-4 sm:px-6 py-3"
          >
            <div class="grid grid-cols-2 gap-3">
              <button
                @click="close"
                class="btn-outline text-red-700 border-red-300 hover:bg-red-50"
              >
                Cancel
              </button>

              <button
                @click="confirm"
                class="btn-primary"
                :style="{ background: pillColor }"
              >
                Add to Cart
              </button>
            </div>
          </div>

          <!-- Close (X) -->
          <button
            class="absolute top-2 right-2 size-8 rounded-full bg-white/90 hover:bg-white text-slate-600 shadow flex items-center justify-center"
            @click="close"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        
        <!-- Numpad Modal -->
        <NumpadModal
          v-if="showNumpad"
          v-model:value="quantity"
          @close="showNumpad = false"
          title="Enter Quantity"
          :min="1"
          :max="999"
        />

        <!-- Keyboard Modal -->
        <KeyboardModal
          v-if="showKeyboard"
          v-model:value="notes"
          @close="showKeyboard = false"
          title="Special Instructions"
          placeholder="Enter any special requests..."
        />
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { computed, ref, watch, onMounted, nextTick } from "vue";
import { useMainStore } from "@/stores/main";
import { storeToRefs } from "pinia";
import getDecimalNumber from "@/lib/getDecimalNumber";
import { useRouter } from "vue-router";
import NumpadModal from "./NumpadModal.vue";
import KeyboardModal from "./KeyboardModal.vue";
const router = useRouter();

const props = defineProps({
  item: { type: Object, required: true },
  show: { type: Boolean, required: true },
  isCart: { type: Boolean, required: false, default: false },
});
const emit = defineEmits(["update:show", "added"]);

// Store
const store = useMainStore();
const { settings, cartItems } = storeToRefs(store);
const { removeFromCart, addLog } = store;

// Currency / decimals
const currency = computed(
  () => settings.value?.merchant?.currency_code || "SAR"
);
const decimals = computed(
  () => settings.value?.pos_settings?.currency_decimals || 2
);

// Image handling (image_url preferred; fallback to image)
const imgError = ref(false);
const candidateImage =
  props.item?.image_url ||
  props.item?.image ||
  props.item?.photo ||
  props.item?.thumbnail ||
  null;
const hasImage = computed(() => !!candidateImage && !imgError.value);
const imageSrc = computed(() => candidateImage);

// Fallback initials avatar
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return Math.abs(h);
}
const palette = [
  ["#22c55e", "#10b981"],
  ["#0ea5e9", "#38bdf8"],
  ["#f59e0b", "#fbbf24"],
  ["#a855f7", "#c084fc"],
  ["#ef4444", "#f87171"],
  ["#06b6d4", "#22d3ee"],
  ["#14b8a6", "#2dd4bf"],
];
const colorIndex = computed(
  () => hash(props.item?.name || "x") % palette.length
);
const colors = computed(() => palette[colorIndex.value] || palette[0]);
const avatarGradient = computed(
  () => `linear-gradient(135deg, ${colors.value[0]}, ${colors.value[1]})`
);
const pillColor = computed(() => colors.value[0]);
const dangerGradient = `linear-gradient(135deg,#ef4444,#f87171)`;

// Item/cart state
const isSelected = (mod) => {
  if (props.isCart) return true;
  return !!selectedModifiers.value.find((m) => m.name == mod.name);
};

const quantity = ref(1);
const sellingPrice = ref(props.item.selling_price || 0);
const selectedModifiers = ref([]);
const selectedUnit = ref(null);
const notes = ref("");
const showNumpad = ref(false);
const showKeyboard = ref(false);
const quantityInput = ref(null);
const cartMatch = computed(
  () => cartItems.value.find((ci) => ci.id === props.item.id) || null
);

// totalPrice computed with getter/setter
const totalPrice = computed({
  get: () => (sellingPrice.value || 0) * (quantity.value || 0),
  set: (v) => {
    quantity.value = sellingPrice.value ? v / sellingPrice.value : 0;
  },
});

// on open
watch(
  () => props.show,
  async (val) => {
    if (val) {
      quantity.value = cartMatch.value?.quantity || props.item.quantity || 1;
      sellingPrice.value =
        cartMatch.value?.selling_price ?? props.item.selling_price ?? 0;
      selectedModifiers.value = cartMatch.value?.modifiers || [];
      selectedUnit.value = cartMatch.value?.selected_unit || null;
      notes.value = cartMatch.value?.notes || "";
      imgError.value = false;
    }
  }
);

// modifier toggle + recalc
function toggleModifier(mod) {
  if (!props.isCart) {
    const idx = selectedModifiers.value.findIndex((m) => m.name === mod.name);
    if (idx > -1)
      selectedModifiers.value = selectedModifiers.value.filter(
        (m) => m.name !== mod.name
      );
    else selectedModifiers.value.push(mod);

    const addSum = selectedModifiers.value.reduce(
      (s, m) => s + (m.additional_price || 0),
      0
    );
    const base =
      selectedUnit.value?.selling_price ?? props.item.selling_price ?? 0;
    sellingPrice.value = base + addSum;
  }
}

function selectUnit(u) {
  selectedUnit.value = u;
  sellingPrice.value =
    (u?.selling_price ?? props.item.selling_price ?? 0) +
    selectedModifiers.value.reduce((s, m) => s + (m.additional_price || 0), 0);
}

function onUnitChange() {
  // kept for compatibility if needed elsewhere
  selectUnit(selectedUnit.value);
}

function decrement() {
  if (quantity.value > 1) quantity.value--;
  else if (quantity.value == 1) {
    quantity.value = 0;
    removeFromCart(props.item, true);
    close();
  }
}
function increment() {
  quantity.value++;
}

function close() {
  emit("update:show", false);
}

function confirm() {
  emit("added", {
    item: props.item,
    quantity: quantity.value,
    selling_price: sellingPrice.value,
    totalPrice: totalPrice.value,
    modifiers: selectedModifiers.value,
    selected_unit: selectedUnit.value,
    notes: notes.value,
  });
  close();
}
</script>

<style scoped>
/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Small, clean chip */
.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  background: #f1f5f9; /* slate-100 */
  color: #334155; /* slate-700 */
  border: 1px solid #e2e8f0; /* slate-200 */
}

/* Field cluster */
.control {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.label {
  font-size: 11px;
  color: #64748b;
  margin-bottom: 0.25rem;
} /* slate-500 */
.input {
  width: 5.5rem;
  height: 2.25rem;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
  padding: 0.25rem 0.5rem;
  outline: none;
}
.input:focus {
  box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.4);
} /* sky-400 ring */
.hint {
  margin-top: 0.25rem;
  font-size: 10px;
  color: #94a3b8;
} /* slate-400 */

/* Section headings */
.section-title {
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.5rem;
} /* slate-900 */

/* Unit card */
.unit-card {
  border: 1px solid #e2e8f0;
  background: white;
  color: #0f172a;
  border-radius: 0.75rem;
  padding: 0.625rem 0.75rem;
  text-align: center;
  font-weight: 700;
  font-size: 0.85rem;
}
.unit-card:hover {
  background: #f8fafc;
} /* slate-50 */
.unit-selected {
  color: white;
  border-color: transparent;
  background: linear-gradient(135deg, #0ea5e9, #38bdf8);
}

/* Buttons */
.btn-outline {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 2.5rem;
  border-radius: 0.75rem;
  border-width: 1px;
  font-weight: 700;
  font-size: 0.9rem;
  transition: transform 0.05s ease;
  background: white;
}
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 2.5rem;
  border-radius: 0.75rem;
  border: none;
  color: white;
  font-weight: 800;
  font-size: 0.95rem;
  transition: transform 0.05s ease;
}
.btn-outline:active,
.btn-primary:active {
  transform: translateY(1px);
}
</style>
