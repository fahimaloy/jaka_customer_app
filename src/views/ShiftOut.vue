<template>
  <div class="flex flex-col p-2 gap-4 mt-4 items-center h-screen">
    <h3 class="text-xl text-slate-500 text-center">
      User: {{ shiftUser?.username }} <br />
      Shifting Out!
    </h3>
    <PinScreen :shiftout="true" :summary="shiftSummary" />
  </div>
</template>
<script setup>
import PinScreen from "@/components/PinScreen.vue";
import { ref, computed, watch } from "vue";
import { useMainStore } from "@/stores/main";
import { storeToRefs } from "pinia";
const store = useMainStore();
const { order_list, shiftUser } = storeToRefs(store);
const shiftAccounts = ref({
  totalOthers: 0,
  totalCash: 0,
  totalCard: 0,
  notes: null,
});

const shiftSummary = ref({
  totalSale: 0,
  totalCash: 0,
  totalCard: 0,
  totalOthers: 0,
  total_vat: 0,
  total_discounts: 0,
});

const sales = ref(0);
const cashSales = ref(0);
const cardSales = ref(0);
const otherSales = ref(0);
const cardDifference = ref(0);
const totalDifference = ref(0);
const cashDifference = ref(0);
const count = ref(0);

watch(
  [() => order_list.value, () => shiftAccounts.value],
  () => {
    if (!shiftAccounts.value.totalOthers) shiftAccounts.value.totalOthers = 0;
    if (!shiftAccounts.value.totalCash) shiftAccounts.value.totalCash = 0;
    if (!shiftAccounts.value.totalCard) shiftAccounts.value.totalCard = 0;

    let salesAmount = 0;
    let discount = 0;
    let tax = 0;
    let card = 0;
    let cash = 0;
    let other = 0;

    const shift_id = shiftUser?.value?.id;

    if (order_list.value && order_list.value.length) {
      order_list.value.forEach((item) => {
        if (shift_id && item?.shift_id && item.shift_id == shift_id) {
          salesAmount += parseFloat(item?.cartState?.totalPayableAmount);
          tax += parseFloat(item?.cartState?.tax);
          discount += parseFloat(item?.cartState?.discount);

          if (item?.paymentMethod.toLowerCase() == "cash") {
            cash += parseFloat(item?.cartState?.totalPayableAmount);
          } else if (item?.paymentMethod.toLowerCase() == "card") {
            card += parseFloat(item?.cartState?.totalPayableAmount);
          } else {
            other += parseFloat(item?.cartState?.totalPayableAmount);
          }
        }
      });
    }

    cashSales.value = cash;
    cardSales.value = card;
    otherSales.value = other;
    sales.value = salesAmount;

    cardDifference.value = shiftAccounts.value.totalCard - card;
    cashDifference.value = shiftAccounts.value.totalCash - cash;
    totalDifference.value =
      shiftAccounts.value.totalCard -
      card +
      shiftAccounts.value.totalCash -
      cash;
  },
  { deep: true }
);
</script>
