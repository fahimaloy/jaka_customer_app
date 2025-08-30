<template>
  <div
    @click="openModal"
    class="w-full rounded-lg flex flex-col gap-2 bg-white active:bg-gray-100 shadow-sm p-2 cursor-pointer"
  >
    <div class="flex items-center justify-between">
      <div
        class="flex flex-col gap-1 text-sm font-semibold text-slate-900 uppercase"
      >
        <div>{{ item.name }}</div>
        <div v-if="item?.arabic_name">{{ item.arabic_name }}</div>
      </div>
      <div class="text-base text-slate-700 flex space-x-4">
        <span>
          {{
            getDecimalNumber(
              item.selling_price,
              settings?.pos_settings?.currency_decimals || 2
            )
          }}
        </span>
        <span>x {{ parseFloat(item.quantity).toFixed(2) }}</span>
        <span>
          {{
            getDecimalNumber(
              item.totalPrice,
              settings?.pos_settings?.currency_decimals || 2
            )
          }}
        </span>
      </div>
    </div>

    <div v-if="item.notes" class="text-xs text-input-muted">
      Note: {{ item.notes }}
    </div>

    <div v-if="item.modifiers?.length" class="text-xs text-slate-600">
      <!-- <b>Modifiers:</b> -->
      <div v-for="mod in item.modifiers" :key="mod.id">
        {{ mod.name }} -
        {{
          getDecimalNumber(
            mod.additional_price,
            settings?.pos_settings?.currency_decimals || 2
          )
        }}
      </div>
    </div>
  </div>

  <ItemModal
    :item="item"
    v-model:show="showModal"
    @added="handleAdd"
    is-cart="true"
  />
</template>

<script setup>
import { ref, computed , onMounted} from "vue";
import { useMainStore } from "@/stores/main";
import { storeToRefs } from "pinia";
import getDecimalNumber from "@/lib/getDecimalNumber";
import ItemModal from "./ItemModal.vue";

const props = defineProps({
  item: { type: Object, required: true },
});

const store = useMainStore();
const { cartItems, settings, defaultLocation, locations } = storeToRefs(store);
const { addToCart, removeFromCart } = store;
onMounted(()=>{
console.log(locations.value.find(el=>el.id == defaultLocation.value))
})
// modal visibility state
const showModal = ref(false);

// find existing cart entry
const cartMatch = computed(
  () => cartItems.value.find((ci) => ci.id === props.item.id) || null
);

// tax inclusion flag
const is_tax_inclusive = computed(
  () => defaultLocation.value ? locations.value.find(el=>el.id == defaultLocation.value)?.is_tax_inclusive || false : settings.value.location?.is_tax_inclusive || false
);

// open modal on click
function openModal() {
  showModal.value = true;
}

// handle modal add/update event
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
    totalPrice: totalPrice,
    modifiers,
    is_tax_inclusive: is_tax_inclusive.value,
    notes,
    selected_unit,
  };
  // console.log(payload);
  if (delta >= 0) {
    addToCart({ ...payload, add_quantity: quantity });
  } else if (delta < 0) {
    removeFromCart({ ...payload, remove_quantity: quantity });
  }
}
</script>

<style scoped>
/* Optional: adjust spacing or hover styles */
</style>
