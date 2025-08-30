<template>
  <div class="p-3 min-h-screen h-full pb-32 overflow-y-scroll bg-gray-50">
    <h1 class="text-lg font-bold mb-4 text-primary">
      {{ isEdit ? "Edit" : "Add" }} Customer
    </h1>

    <form
      @submit.prevent="handleSubmit"
      class="space-y-3 h-full overflow-y-scroll"
    >
      <!-- Name -->
      <div class="form-group">
        <label class="block text-xs font-medium mb-0.5">Name</label>
        <input
          v-model="name"
          type="text"
          class="w-full py-1.5 px-3 border rounded-md focus:ring-1 focus:ring-primary text-sm"
        />
      </div>

      <!-- Phone -->
      <div class="form-group">
        <label class="block text-xs font-medium mb-0.5"
          >Phone <span class="text-red-500">*</span></label
        >
        <input
          v-model="phone"
          type="tel"
          required
          class="w-full py-1.5 px-3 border rounded-md focus:ring-1 focus:ring-primary text-sm"
        />
      </div>

      <!-- Tax Registration -->
      <div class="form-group">
        <label class="block text-xs font-medium mb-0.5"
          >Tax Registration Number</label
        >
        <input
          v-model="taxRegNum"
          type="text"
          class="w-full py-1.5 px-3 border rounded-md focus:ring-1 focus:ring-primary text-sm"
        />
      </div>

      <!-- Address Type & Language -->
      <div class="grid grid-cols-2 gap-3">
        <div class="form-group">
          <label class="block text-xs font-medium mb-0.5">Address Type</label>
          <select
            v-model="addressType"
            class="w-full py-1.5 px-3 border rounded-md focus:ring-1 focus:ring-primary text-sm"
          >
            <option value="Home">Home</option>
            <option value="Work">Work</option>
            <option value="Others">Others</option>
          </select>
        </div>
        <div class="form-group">
          <label class="block text-xs font-medium mb-0.5">Language</label>
          <select
            v-model="language"
            class="w-full py-1.5 px-3 border rounded-md focus:ring-1 focus:ring-primary text-sm"
          >
            <option value="English">English</option>
            <option value="Arabic">Arabic</option>
          </select>
        </div>
      </div>

      <!-- Street -->
      <div class="form-group">
        <label class="block text-xs font-medium mb-0.5">Street</label>
        <input
          v-model="addressStreet"
          type="text"
          class="w-full py-1.5 px-3 border rounded-md focus:ring-1 focus:ring-primary text-sm"
        />
      </div>

      <!-- Building & Room No. -->
      <div class="grid grid-cols-2 gap-3">
        <div class="form-group">
          <label class="block text-xs font-medium mb-0.5">Building</label>
          <input
            v-model="addressBuilding"
            type="text"
            class="w-full py-1.5 px-3 border rounded-md focus:ring-1 focus:ring-primary text-sm"
          />
        </div>
        <div class="form-group">
          <label class="block text-xs font-medium mb-0.5">Room No.</label>
          <input
            v-model="addressRoomNum"
            type="text"
            class="w-full py-1.5 px-3 border rounded-md focus:ring-1 focus:ring-primary text-sm"
          />
        </div>
      </div>
      <!-- City & District -->
      <div class="grid grid-cols-2 gap-3">
        <div class="form-group">
          <label class="block text-xs font-medium mb-0.5">City</label>
          <input
            v-model="addressCity"
            type="text"
            class="w-full py-1.5 px-3 border rounded-md focus:ring-1 focus:ring-primary text-sm"
          />
        </div>
        <div class="form-group">
          <label class="block text-xs font-medium mb-0.5">District</label>
          <input
            v-model="addressDistrict"
            type="text"
            class="w-full py-1.5 px-3 border rounded-md focus:ring-1 focus:ring-primary text-sm"
          />
        </div>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        class="w-full py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-dark-primary"
      >
        {{ isEdit ? "Update Customer" : "Create Customer" }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useMainStore } from "@/stores/main";
import { storeToRefs } from "pinia";
import axios from "axios";
import { updateCustomer, createCustomer } from "@/lib/db/customers";

const store = useMainStore();
const { baseURL, shiftUser, settings } = storeToRefs(store);
const { setForceLogout } = store;
const route = useRoute();
const router = useRouter();

const isEdit = ref(false);
// Form fields
const name = ref("");
const phone = ref("");
const taxRegNum = ref("");
const addressType = ref("Home");
const addressCity = ref("");
const addressDistrict = ref("");
const addressStreet = ref("");
const addressBuilding = ref("");
const addressRoomNum = ref("");
const language = ref("English");

onMounted(() => {
  if (route.params.customer) {
    isEdit.value = true;
    const customer = JSON.parse(route.params.customer);
    console.log("Customer To Change: ", customer);
    name.value = customer.name;
    phone.value = customer.phone;
    taxRegNum.value = customer.tax_reg_num;
    addressType.value = customer.address_type;
    addressCity.value = customer.address_city;
    addressDistrict.value = customer.address_district;
    addressStreet.value = customer.address_street;
    addressBuilding.value = customer.address_building;
    addressRoomNum.value = customer.address_room_num;
    language.value = customer.language;
  }
});

const handleSubmit = async () => {
  const payload = {
    name: name.value,
    phone: phone.value,
    tax_reg_num: taxRegNum.value,
    address_type: addressType.value,
    region: addressCity.value,
    district: addressDistrict.value,
    street: addressStreet.value,
    building: addressBuilding.value,
    room: addressRoomNum.value,
    language: language.value,
    pos_id: settings.value?.pos_device?.id,
    user_id: shiftUser.value?.location_user_id,
    location_id: settings.value?.location?.id,
    username: shiftUser.value?.username || undefined,
  };

  try {
    const response = await axios.post(
      `${baseURL.value}/create-store-customer`,
      { data: payload },
      { headers: { Authorization: localStorage.getItem("token") } }
    );

    if ([200, 201, 202].includes(response.status)) {
      const data = response.data;
      const search_name = data.name?.toLowerCase?.() || data.name;

      if (data.type === "update") {
        const updated = {
          ...data,
          search_name,
          address: `${data?.address_room_num || ""}${
            data?.address_building || ""
          } ${data?.address_street || ""} ${data?.address_district || ""} ${
            data?.address_city || ""
          }`,
        };
        const dbres = await updateCustomer(updated);
        console.log("Customer Update Response:", dbres);
        if (dbres.success) {
          alert("Customer updated successfully");
          router.push("/customers");
        } else {
          alert(`Customer update failed [DB ERROR]: ${dbres.error}`);
        }
      } else if (data.id) {
        const created = {
          ...data,
          search_name,
          address: `${data?.address_room_num || ""}${
            data?.address_building || ""
          } ${data?.address_street || ""} ${data?.address_district || ""} ${
            data?.address_city || ""
          }`,
        };
        const dbres = await createCustomer(created);
        if (dbres.success) {
          alert("Customer created successfully");
          router.push("/customers");
        } else {
          alert(`Customer creation failed [DB ERROR]: ${dbres.error}`);
        }
      }
    } else {
      const err =
        response.data.error || response.data.details || "Some Error Occurred";
      alert(err);
    }
  } catch (error) {
    console.error(error);
    const detail = error.response?.data;
    if (detail?.detail === "Authentication credentials were not provided.") {
      setForceLogout(true);
    } else {
      const err =
        detail?.error ||
        detail?.details ||
        JSON.stringify(detail) ||
        "Some Error Occurred";
      alert(err);
    }
  }
};
</script>

<style>
.form-group {
  @apply mb-3;
}
</style>
