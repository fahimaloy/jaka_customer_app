<template>
  <div
    style="margin-top: 0"
    class="fixed top-0 left-0 w-full h-full bg-black/70 z-[999999] flex items-center justify-center"
  >
    <form
      @submit.prevent="apply"
      class="relative w-3/4 md:w-1/2 bg-gray-100 rounded-md flex flex-col items-center gap-2 m-6"
    >
      <div
        class="flex flex-col w-full px-4 gap-4 text-sm py-4 bg-transparent text-slate-800 font-semibold rounded-md"
      >
        <h3 class="text-lg font-semibold text-center py-1 border-b">
          {{ edit ? "Edit" : "Add" }} Customer
        </h3>
        <!-- Name Field -->
        <div class="grid grid-cols-3 w-full justify-between items-center">
          <div>Name:</div>
          <input
            v-model="name"
            required
            type="text"
            placeholder="Enter Name"
            class="col-span-2 border bg-white rounded-md px-2 py-1 w-full"
          />
        </div>

        <!-- Phone Field -->
        <div class="grid grid-cols-3 w-full justify-between items-center">
          <div>Phone:</div>
          <input
            v-model="phone"
            required
            type="text"
            placeholder="Enter Phone"
            class="col-span-2 border bg-white rounded-md px-2 py-1 w-full"
          />
        </div>

        <!-- Email Field -->
        <div class="grid grid-cols-3 w-full justify-between items-center">
          <div>Email:</div>
          <input
            v-model="email"
            type="email"
            placeholder="Enter Email"
            class="col-span-2 border bg-white rounded-md px-2 py-1 w-full"
          />
        </div>
        <!-- Tax Reg Num Field -->
        <div class="grid grid-cols-3 w-full justify-between items-center">
          <div>Tax Reg Num:</div>
          <input
            v-model="taxRegNum"
            type="text"
            placeholder="Enter Tax Reg Num"
            class="col-span-2 border bg-white rounded-md px-2 py-1 w-full"
          />
        </div>

        <!-- Language Field -->
        <div class="grid grid-cols-3 w-full justify-between items-center">
          <div>Language:</div>
          <select
            v-model="language"
            class="col-span-2 border bg-white rounded-md px-2 py-1 w-full"
          >
            <option value="English">English</option>
            <option value="Arabic">Arabic</option>
          </select>
        </div>

        <!-- Address Field -->
        <div class="grid grid-cols-3 w-full justify-between items-center">
          <div>Address:</div>
          <textarea
            v-model="address"
            placeholder="Enter Address"
            class="col-span-2 border bg-white rounded-md px-2 py-1 w-full"
            rows="3"
          ></textarea>
        </div>
      </div>

      <div
        class="flex w-full justify-end gap-2 items-center p-2 rounded-md rounded-t-none bg-gray-100 border-t border-t-slate-300 shadow"
      >
        <button
          :disabled="!enableApply"
          class="shadow disabled:bg-blue-200 disabled:cursor-not-allowed p-3 px-6 w-full rounded-md bg-cyan-700 hover:bg-cyan-800 text-base font-bold text-white"
          type="submit"
        >
          Add
        </button>
        <button
          @click.prevent="$emit('cancelled')"
          class="shadow p-3 px-6 w-full rounded-md bg-red-700 hover:bg-red-800 text-base font-bold text-white"
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useMainStore } from "@/stores/main";
import { useToast } from "vue-toast-notification";
import { storeToRefs } from "pinia";
const $toast = useToast();
const name = ref("");
const phone = ref("");
const email = ref("");
const taxRegNum = ref("");
const language = ref("English");
const address = ref("");
const enableApply = ref(true);
const store = useMainStore();
const { addCustomer } = store;
const { selected_customer } = storeToRefs(store);
const props = defineProps({
  edit: {
    type: Boolean,
    default: false,
  },
});
onMounted(() => {
  if (props.edit && selected_customer.value) {
    email.value = selected_customer.value.email;
    phone.value = selected_customer.value.phone;
    taxRegNum.value = selected_customer.value.tax_reg_num;
    name.value = selected_customer.value.name;
    address.value = selected_customer.value.address;
    language.value = selected_customer.value.language;
  }
});
const emit = defineEmits(["cancelled"]);
const apply = async () => {
  console.log({
    name: name.value,
    phone: phone.value,
    tax_reg_num: taxRegNum.value,
    language: language.value,
    address: address.value,
  });
  const payload = {
    name: name.value,
    phone: phone.value,
    email: email.value,
    tax_reg_num: taxRegNum.value,
    language: language.value,
    address: address.value,
  };
  if (props.edit && selected_customer.value) {
    payload.id = selected_customer.value?.id;
    payload.type = "update";
  }
  const data = await addCustomer(payload);
  $toast.open({
    type: data && data?.success ? "success" : "error",
    message: (data && data?.message) || "Message",
    position: "top",
    duration: 800,
  });
  emit("cancelled");
};
</script>
