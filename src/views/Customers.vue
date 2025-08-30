<template>
  <div
    class="flex flex-col gap-2 overflow-y-scroll max-h-[90vh] h-[90vh] pb-20 px-4"
  >
    <!-- <AddCustomerModal
      @cancelled="
        () => {
          show_add_customer_modal = false;
          edit = false;
        }
      "
      :edit="edit"
      v-if="show_add_customer_modal"
    /> -->
    <div class="w-full flex gap-4 items-center m-2 justify-between">
      <h3 class="text-lg font-semibold">Customer List</h3>
      <div class="flex gap-4 items-center">
        <button
          v-if="selected_customer"
          @click="
            () => {
              router.push(
                `/customers/edit/${encodeURIComponent(
                  JSON.stringify(selected_customer)
                )}`
              );
              // edit = true;
              // show_add_customer_modal = true;
            }
          "
          class="p-2 px-6 border bg-yellow-600 text-xs text-white rounded-md shadow-md"
        >
          Edit
        </button>
      </div>
    </div>
    <div class="flex flex-wrap gap-2">
      <div
        @click="
          () => {
            if (selected_customer && selected_customer?.id == customer?.id) {
              set_selected_customer(null);
            } else {
              set_selected_customer(customer);
            }
          }
        "
        v-for="customer in customer_list"
        :class="
          selected_customer && selected_customer?.id == customer?.id
            ? 'bg-primary text-white'
            : 'bg-white'
        "
        class="flex flex-col text-wrap gap-2 rounded-md shadow p-4 w-[48%] cursor-pointer"
      >
        <div class="text-sm font-semibold text-wrap break-all">
          {{ customer?.name }}
        </div>
        <div class="text-xs font-medium text-wrap">{{ customer?.phone }}</div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { useMainStore } from "@/stores/main";
import AddCustomerModal from "@/components/AddCustomerModal.vue";
import { storeToRefs } from "pinia";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();
const show_add_customer_modal = ref(false);
const store = useMainStore();
const { customer_list, selected_customer } = storeToRefs(store);
const { searchCustomers } = store;
onMounted(() => {
  searchCustomers("");
});
const { set_selected_customer } = store;
const edit = ref(false);
</script>
