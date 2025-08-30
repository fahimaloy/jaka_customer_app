<template>
  <div
    style="margin-top: 0"
    class="fixed top-0 left-0 w-full h-full bg-black/70 z-[999999] flex items-center justify-center"
  >
    <div
      class="relative w-3/4 md:w-fit bg-gray-200 rounded-md flex flex-col items-center gap-2 m-6"
    >
      <div
        class="flex flex-col w-full px-4 gap-4 text-sm py-4 bg-transparent text-slate-800 font-semibold rounded-md"
      >
        <div class="grid grid-cols-3 w-full justify-between items-center">
          <div>Discount Type:</div>
          <select
            v-model="type"
            class="col-span-2 border bg-white rounded-md px-2 py-1 w-full"
          >
            <option value="fixed">Fixed</option>
            <option value="percentage">Percentage</option>
            <option value="final">Final</option>
          </select>
        </div>
        <div class="grid grid-cols-3 w-full justify-between items-center">
          <div>Amount:</div>
          <input
            v-model="amount"
            placeholder="Enter Amount"
            class="col-span-2 border bg-white rounded-md px-2 py-1"
          />

          <div></div>
          <div v-if="amountErr" class="col-span-2 text-xs mt-1 text-red-600">
            * Discount Cannot be greater than the total amount!
          </div>
        </div>
        <div class="grid grid-cols-3 w-full justify-between items-center">
          <div>Note:</div>
          <input
            v-model="note"
            placeholder="Enter Note"
            class="col-span-2 border bg-white rounded-md px-2 py-1"
          />
          <div></div>
          <div v-if="error" class="col-span-2 text-xs mt-1 text-red-600">
            * Note for discount is required & should be minimum of 5 characters!
          </div>
        </div>
      </div>
      <div
        class="flex w-full justify-end gap-2 items-center p-2 rounded-md rounded-t-none bg-gray-100 border-t border-t-slate-300 shadow"
      >
        <button
          :disabled="!enableApply"
          @click="apply"
          class="shadow disabled:bg-blue-200 disabled:cursor-not-allowed p-3 px-6 w-full rounded-md bg-cyan-700 hover:bg-cyan-800 text-base font-bold text-white"
        >
          Apply
        </button>
        <button
          @click="$emit('cancelled')"
          class="shadow p-3 px-6 w-full rounded-md bg-red-700 hover:bg-red-800 text-base font-bold text-white"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, watch, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useToast } from "vue-toast-notification";
import { useMainStore } from "@/stores/main";
const store = useMainStore();
const { settings, cartState } = storeToRefs(store);
const { applyDiscount } = store;
const type = ref("fixed");
const amount = ref(0);
const amountErr = ref(false);
const note = ref("");
const error = ref(null);
const enableApply = ref(false);
const emit = defineEmits(["cancelled"]);
const $toast = useToast();
onMounted(() => {
  console.log(cartState.value);
  if (cartState.value?.discount) {
    amount.value = cartState.value.discount;
  }
  if (cartState.value?.discount_note) {
    note.value = cartState.value.discount_note;
  }
});
watch([amount, note], ([aV, nV]) => {
  console.log(aV, nV, settings.value?.pos_settings?.discount_note_mandatory);
  if (parseFloat(aV) > 0) {
    if (settings.value?.pos_settings?.discount_note_mandatory == true) {
      if (!note.value || note.value == "" || note.value.length < 5) {
        enableApply.value = false;
        error.value = true;
      } else {
        enableApply.value = true;
        error.value = false;
      }
    } else {
      enableApply.value = true;
    }
  } else {
    enableApply.value = false;
  }
});
const apply = () => {
  error.value = null;
  amountErr.value = false;
  const payload = {
    discountType: type.value,
    discountAmount: parseFloat(amount.value),
    discountNote: note.value,
  };
  if (
    (type.value == "fixed" &&
      payload.discountAmount > cartState.value.totalAmount) ||
    (type.value == "percentage" && payload.discountAmount > 100) ||
    (type.value == "final" &&
      payload.discountAmount > cartState.value.totalPayableAmount)
  ) {
    amountErr.value = true;
    return;
  }
  if (
    settings.value?.pos_settings?.discount_note_mandatory == true &&
    (!note.value || note.value == "" || note.value.length < 5)
  ) {
    error.value = true;
    return;
  }
  applyDiscount(payload);
  emit("cancelled");
};
</script>
