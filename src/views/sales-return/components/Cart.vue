<template>
  <div
    class="flex flex-col h-full border border-slate-900 shadow-sm bg-custom-dgrey text-white"
  >
    <!-- Header -->
    <div
      class="text-sm font-bold uppercase flex items-center justify-center px-3 py-1 border-b border-slate-900"
    >
      {{ title }}
    </div>

    <!-- Items List -->
    <div class="flex flex-col gap-2 p-2 flex-grow overflow-y-auto">
      <div
        v-for="item in items"
        :key="item.id"
        class="bg-white rounded text-custom-dgrey font-medium grid grid-cols-12 gap-1 items-center px-4 py-2 border-b text-xs"
      >
        <!-- move from refund back to original -->
        <button
          v-if="side === 'right'"
          @click="$emit('move-item', item.id)"
          class="col-span-1 flex items-center justify-center text-blue-600 border-2 border-blue-600 rounded hover:bg-blue-100"
        >
          &lt;
        </button>

        <!-- name -->
        <div class="col-span-5 font-bold">{{ item.name }}</div>

        <!-- unit price -->
        <div class="col-span-2">
          {{ format(item.selling_price + item.single_qty_tax) }}
        </div>

        <!-- quantity -->
        <div v-if="side === 'left'" class="col-span-2">
          x{{ format(item.quantity) }}
        </div>
        <div v-else class="col-span-2">
          <input
            type="number"
            min="0"
            class="w-12 p-1 border rounded bg-gray-100 text-center text-sm text-custom-dgrey"
            :value="item.quantity"
            @input="
              (e) => $emit('change-quantity', Number(e.target.value), item.id)
            "
          />
        </div>

        <!-- line total -->
        <div class="col-span-2">
          {{
            format(item.quantity * (item.selling_price + item.single_qty_tax))
          }}
        </div>

        <!-- move from original to refund -->
        <button
          v-if="side === 'left'"
          @click="$emit('move-item', item.id)"
          class="col-span-1 flex items-center justify-center text-blue-600 border-2 border-blue-600 rounded hover:bg-blue-100"
        >
          &gt;
        </button>
      </div>
    </div>

    <!-- Summary & Actions -->
    <div class="p-4 border-t text-sm overflow-y-scroll">
      <!-- summary -->
      <div v-if="!isRefundFormVisible" class="grid grid-cols-4 gap-2">
        <div class="flex flex-col items-center">
          <span>Subtotal</span>
          <span>{{ format(cartState.totalAmount) }}</span>
        </div>
        <div class="flex flex-col items-center">
          <span>Discount</span>
          <span>{{ format(cartState.discount) }}</span>
        </div>
        <div class="flex flex-col items-center">
          <span>Tax</span>
          <span>{{ format(cartState.tax) }}</span>
        </div>
        <div class="flex flex-col items-center">
          <span>Charge</span>
          <span>{{ format(cartState.charge) }}</span>
        </div>

        <div class="col-span-4 pt-2 border-t mt-2 grid grid-cols-3 gap-2">
          <div class="flex flex-col items-center">
            <span>Items</span>
            <span>{{ items.length }}</span>
          </div>
          <div class="flex flex-col items-center">
            <span>Quantity</span>
            <span>{{ totalQuantity }}</span>
          </div>
          <div class="flex flex-col items-center font-semibold text-base">
            <span>Total Payable</span>
            <span>SAR {{ format(cartState.totalPayableAmount) }}</span>
          </div>
        </div>
      </div>

      <!-- refund form -->
      <div
        v-if="side === 'right' && isRefundFormVisible"
        class="mt-4 space-y-4"
      >
        <div>
          <label class="inline-flex items-center space-x-2">
            <input type="radio" value="RETURNED" v-model="localReason" />
            <span>RETURNED</span>
          </label>
          <label class="inline-flex items-center space-x-2 ml-4">
            <input type="radio" value="MISTAKE" v-model="localReason" />
            <span>MISTAKE</span>
          </label>
          <label class="inline-flex items-center space-x-2 ml-4">
            <input type="radio" value="CANCELLED" v-model="localReason" />
            <span>CANCELLED</span>
          </label>
          <label class="inline-flex items-center space-x-2 ml-4">
            <input type="radio" value="OTHER" v-model="localReason" />
            <span>OTHER</span>
          </label>
        </div>

        <input
          type="text"
          placeholder="Note"
          v-model="localNote"
          class="w-full p-2 border rounded bg-white text-custom-dgrey focus:outline-none"
        />

        <select
          v-model="localMethod"
          class="w-full p-2 border rounded bg-white text-custom-dgrey focus:outline-none"
        >
          <option value="CASH">Cash</option>
          <option value="CARD">Card</option>
        </select>
      </div>

      <!-- footer buttons -->
      <div class="flex flex-wrap gap-2 mt-3">
        <template v-if="side === 'left'">
          <button
            @click="$emit('clear')"
            class="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded"
          >
            Clear
          </button>
          <button
            @click="$emit('full-invoice-refund')"
            :disabled="!items.length"
            class="flex-1 bg-blue-600 disabled:bg-blue-300 hover:bg-blue-700 text-white py-2 rounded"
          >
            Full Invoice Refund
          </button>
        </template>

        <template v-else>
          <template v-if="isRefundFormVisible">
            <button
              @click="$emit('confirm')"
              :disabled="refundLoading"
              class="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white py-2 rounded"
            >
              Confirm
            </button>
            <button
              @click="$emit('back')"
              class="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded"
            >
              Back
            </button>
          </template>
          <template v-else>
            <button
              @click="$emit('checkout')"
              class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
            >
              Refund
            </button>
            <button
              @click="$emit('clear')"
              class="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded"
            >
              Clear
            </button>
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { defineProps, defineEmits } from "vue";
import { formatDecimalToEighth } from "@/lib/calculate";

const props = defineProps({
  title: String,
  side: { type: String, default: "left" },
  items: { type: Array, default: () => [] },
  cartState: { type: Object, default: () => ({}) },
  settings: {
    type: Object,
    default: () => ({ pos_settings: { currency_decimal: 2 } }),
  },
  isRefundFormVisible: { type: Boolean, default: false },
  refundReason: String,
  note: String,
  refundMethod: String,
  refundLoading: Boolean,
});

const emit = defineEmits([
  "move-item",
  "clear",
  "full-invoice-refund",
  "checkout",
  "back",
  "confirm",
  "change-quantity",
  "reason-change",
  "note-change",
  "method-change",
]);

const totalQuantity = computed(() =>
  props.items.reduce((sum, i) => sum + (i.quantity || 0), 0)
);

const format = (num) =>
  formatDecimalToEighth(num, props.settings.pos_settings.currency_decimal);

// two-way for refund form fields
const localReason = computed({
  get: () => props.refundReason,
  set: (v) => emit("reason-change", v),
});
const localNote = computed({
  get: () => props.note,
  set: (v) => emit("note-change", v),
});
const localMethod = computed({
  get: () => props.refundMethod,
  set: (v) => emit("method-change", v),
});
</script>

<style scoped>
.bg-custom-dgrey {
  background: #2d2d2d;
}
.text-custom-dgrey {
  color: #333;
}
</style>
