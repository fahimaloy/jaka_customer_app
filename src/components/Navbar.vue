<template>
  <div
    class="z-[9999999] bg-white max-w-[100vw] w-full flex items-center justify-between gap-2 p-4 py-2 shadow"
  >
    <div class="flex gap-2">
      <div
        @click="$emit('toggle-sidebar')"
        class="font-bold text-center p-2 cursor-pointer rounded-full w-fit"
      >
        <unicon
          :height="20"
          :width="20"
          name="align-justify"
          fill="black"
        ></unicon>
      </div>

      <!-- <div
        v-if="route?.fullPath !== '/home' && !openSearch"
        @click="router.push('/home')"
        class="cursor-pointer p-2 rounded-lg flex items-center justify-center border hover:bg-gray-200"
      >
        Items
      </div> -->
    </div>

    <div class="flex items-center justify-center gap-2 px-2">
      <div v-if="openSearch" class="flex flex-col items-center gap-1">
        <div class="flex items-center gap-0.5">
          <input
            autofocus
            placeholder="Search"
            v-model="searchValue"
            class="w-fit bg-white border rounded-lg px-2 py-1"
          />
        </div>
      </div>
      <div
        @click="
          () => {
            searchValue = '';
            openSearch = !openSearch;
          }
        "
        class="cursor-pointer p-1.5 rounded-lg flex items-center gap-1 justify-center border hover:bg-gray-200"
      >
        <unicon
          v-if="!openSearch"
          :height="15"
          :width="15"
          name="search"
          fill="black"
        ></unicon>
        <unicon
          v-else
          :height="15"
          :width="15"
          name="times"
          fill="black"
        ></unicon>
      </div>

      <div
        v-if="!openSearch"
        @click="plusFunc"
        class="cursor-pointer p-1.5 rounded-lg flex items-center justify-center border hover:bg-gray-200"
      >
        <unicon :height="15" :width="15" name="plus" fill="black"></unicon>
      </div>
      <div v-if="showScanner" id="reader" class="mt-4"></div>
    </div>
  </div>
</template>
<script setup>
import { useMainStore } from "@/stores/main";
import { Html5Qrcode } from "html5-qrcode";
import { storeToRefs } from "pinia";
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
const showScanner = ref(false);
const scannerInstance = ref(null);

const openScanner = () => {
  showScanner.value = true;

  const html5QrCode = new Html5Qrcode("reader");
  scannerInstance.value = html5QrCode;

  html5QrCode
    .start(
      { facingMode: "environment" }, // Use the back camera
      {
        fps: 10, // Frames per second for scanning
        qrbox: { width: 250, height: 250 }, // Scanning box size
      },
      (decodedText) => {
        alert(`Scanned Barcode: ${decodedText}`);
        stopScanner();
      },
      (errorMessage) => {
        console.error(errorMessage); // Log errors during scanning
      }
    )
    .catch((err) => {
      console.error("Error starting QR Code scanner: ", err);
    });
};

const stopScanner = () => {
  if (scannerInstance.value) {
    scannerInstance.value.stop().then(() => {
      scannerInstance.value.clear();
      showScanner.value = false;
    });
  }
};
const store = useMainStore();
const openSearch = ref(false);
const {
  setAuthenticated,
  shiftLogout,
  selectOrderType,
  searchItems,
  setSyncCustomer,
  searchCustomers,
} = store;
const router = useRouter();
const route = useRoute();
const { cartItems, settings, selected_order_type } = storeToRefs(store);
const order_types = computed(() =>
  settings.value?.price_categories && settings.value?.price_categories.length
    ? [...settings.value?.price_categories].sort(
        (a, b) => a.position - b.position
      )
    : []
);
const searchValue = ref(null);
const searchItem = (value) => {
  console.log(value);
  searchItems(value);
};
const searchCustomer = (value) => {
  console.log(value);
  searchCustomers(value);
};
watch(searchValue, (value) => {
  console.log(route);
  if (route.name == "home") {
    searchItem(value);
  } else if (route.name == "customers") {
    searchCustomer(value);
  }
});
const selected_type = ref();
watch(order_types, () => {
  if (order_types.value?.length) {
    selected_type.value = order_types.value[0].id;
  }
});
onMounted(() => {
  console.log(selected_order_type.value);
  if (selected_order_type.value) {
    selected_type.value = selected_order_type.value;
  } else if (order_types.value?.length) {
    selected_type.value = order_types.value[0].id;
  }
});

const changeOrderType = (type) => {
  selectOrderType(selected_type.value);
};

const plusFunc = () => {
  if (route.name == "customers") {
    router.push(`/customers/add`);
  } else {
    router.push(`/items/add`);
  }
};
</script>
