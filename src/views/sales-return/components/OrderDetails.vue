<template>
  <div
    class="flex flex-col h-full border rounded shadow-sm p-4 text-sm bg-transparent text-white"
  >
    <h2 class="text-lg font-bold text-center pb-2 border-b mb-2">
      Order Details
    </h2>

    <div v-if="order" class="space-y-2">
      <div v-if="order.token_counter" class="flex justify-between">
        <span class="font-semibold">Token</span>
        <span>{{ order.token_counter }}</span>
      </div>
      <div v-if="order.invoice_num" class="flex justify-between">
        <span class="font-semibold">Invoice</span>
        <span>{{ order.invoice_num }}</span>
      </div>
      <div v-if="order.ptid" class="flex justify-between">
        <span class="font-semibold">PTID</span>
        <span>{{ order.ptid }}</span>
      </div>
      <div v-if="order.id" class="flex justify-between">
        <span class="font-semibold">Server UID</span>
        <span>{{ order.id }}</span>
      </div>
      <div v-if="order.order_source" class="flex justify-between">
        <span class="font-semibold">Order Source</span>
        <span>{{ order.order_source }}</span>
      </div>
      <div v-if="order.order_destination" class="flex justify-between">
        <span class="font-semibold">Order Destination</span>
        <span>{{ order.order_destination }}</span>
      </div>
      <div v-if="order.payment_method?.name" class="flex justify-between">
        <span class="font-semibold">Payment Method</span>
        <span>{{ order.payment_method.name }}</span>
      </div>
      <div v-if="order.user?.name" class="flex justify-between">
        <span class="font-semibold">Cashier</span>
        <span>{{ order.user.name }}</span>
      </div>

      <template v-if="order.customer">
        <div v-if="order.customer.name" class="flex justify-between">
          <span class="font-semibold">Customer</span>
          <span>{{ order.customer.name }}</span>
        </div>
        <div v-if="order.customer.phone" class="flex justify-between">
          <span class="font-semibold">Customer Phone</span>
          <span>{{ order.customer.phone }}</span>
        </div>
      </template>

      <div v-else class="flex justify-between">
        <span class="font-semibold">Customer</span>
        <button
          @click="$emit('add-customer', order)"
          class="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded"
        >
          Add Customer
        </button>
      </div>
    </div>

    <div v-else class="p-4 text-center">No order selected</div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

const props = defineProps({ order: Object });
const emit = defineEmits(["add-customer"]);
</script>

<style scoped>
/* no extra styles */
</style>
