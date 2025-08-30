<template>
  <div
    class="w-full rounded-lg flex flex-col gap-2 bg-zinc-300 active:bg-gray-100 shadow-sm p-4 py-2"
  >
    <div class="grid grid-cols-12 gap-y-2">
      <div
        class="col-span-12 md:col-span-5 flex flex-col text-sm uppercase font-semibold text-slate-900"
      >
        <span>
          {{ item?.name }}
        </span>
      </div>

      <div
        class="col-span-3 md:col-span-1 text-xs flex flex-col font-semibold text-slate-700 text-left"
      >
        <span>Quantity: {{ parseFloat(item?.quantity).toFixed(2) }}</span>
      </div>
      <div
        class="col-span-3 md:col-span-1 text-xs flex flex-col font-semibold text-slate-700 text-left"
      >
        <span>
          {{ settings?.merchant?.currency_code || "SAR" }}
          {{
            getDecimalNumber(
              item?.selling_price,
              settings?.pos_settings?.currency_decimals || 2
            )
          }}</span
        >
      </div>
      <div
        class="col-span-3 md:col-span-1 text-xs flex flex-col font-semibold text-slate-700 text-center"
      >
        <span> Tax: {{ parseFloat(item?.tax).toFixed(2) }}</span>
      </div>
      <div
        class="col-span-3 md:col-span-1 text-xs flex flex-col font-semibold text-slate-700 text-right"
      >
        <span> SAR {{ parseFloat(item?.totalPrice).toFixed(2) }}</span>
      </div>
    </div>
  </div>
</template>
<script setup>
import { useMainStore } from "@/stores/main";
import { storeToRefs } from "pinia";
import getDecimalNumber from "@/lib/getDecimalNumber";
defineProps({
  item: {
    type: Object,
    Required: true,
  },
});
const store = useMainStore();
const { addToCart, removeFromCart } = store;
const { settings } = storeToRefs(store);
</script>
