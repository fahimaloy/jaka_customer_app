<!-- src/App.vue -->
<template>
  <SplashScreen v-if="loaded" />

  <!-- Auth / setup gates -->
  <div
    v-else-if="!authenticated"
    class="w-full h-full flex flex-col min-h-screen bg-white"
  >
    <div
      v-if="route.fullPath == '/register'"
      @click="router.back()"
      class="p-4 absolute top-2 left-2 cursor-pointer"
    >
      <unicon :height="32" :width="32" name="arrow-left" fill="black" />
    </div>
    <router-view />
  </div>

  <!-- Print route, no shell chrome -->
  <div v-else-if="route.fullPath == '/a4-print'">
    <router-view />
  </div>

  <!-- Main shell -->
  <div v-else class="bg-gray-100 h-full w-full min-h-screen">
    <!-- Make the app shell a column and prevent page scroll -->
    <div class="relative h-screen overflow-hidden flex flex-col">
      <!-- Drawer Sidebar -->
      <SideBar :isOpen="isSidebarOpen" @close="isSidebarOpen = false" />

      <!-- Sidebar backdrop -->
      <div
        @click="toggleSidebar"
        v-if="openSidebar"
        class="fixed inset-0 z-[90] bg-black/60 backdrop-blur-[1px]"
      ></div>

      <!-- Content area: give it its own overflow context -->
      <div
        class="relative transition-transform duration-300 flex-1 min-h-0 overflow-hidden"
      >
        <!--
          IMPORTANT:
          The direct child gets full height and keeps overflow hidden,
          so nested views (like HomeView) can create their OWN scrollers.
        -->
        <div class="h-full w-full overflow-hidden">
          <!-- Global floating drawer toggle -->
          <button
            type="button"
            @click="toggleSidebar"
            class="fixed top-4 left-4 z-[80] rounded-full bg-white text-slate-800 shadow-md ring-1 ring-slate-200 hover:bg-slate-50 active:translate-y-[1px] p-3"
            title="Open menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-[22px] w-[22px]"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </button>

          <!-- HomeView will now control scrolling of its columns independently -->
          <router-view class="h-full w-full" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch, onBeforeUnmount } from "vue";
import SplashScreen from "./components/SplashScreen.vue";
import { useRoute, useRouter } from "vue-router";
import { useMainStore } from "./stores/main";
import { storeToRefs } from "pinia";
import SideBar from "./components/SideBar.vue";
import Navbar from "./components/Navbar.vue";
import DialogueBox from "./components/DialogueBox.vue";
import PACKAGE from "../package.json";
import BottomNavbar from "./components/BottomNavbar.vue";

const loaded = ref(true);
const isSidebarOpen = ref(false);
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};
const openSidebar = ref(false);
watch(isSidebarOpen, (value) => {
  if (value) openSidebar.value = value;
  else
    setTimeout(() => {
      openSidebar.value = value;
    }, 200);
});

// Close drawer on ESC for accessibility
const handleKeydown = (e) => {
  if (e.key === "Escape" && isSidebarOpen.value) {
    isSidebarOpen.value = false;
  }
};

const store = useMainStore();
const {
  logoutForcefully,
  resetCustomerSync,
  updateCustomerSync,
  addCustomers,
  setSyncCustomer,
  setForceLogout,
  set_selected_customer,
  posLogout,
} = store;

const {
  authenticated,
  shiftUser,
  settings,
  baseURL,
  syncCustomer,
  forceLogout,
  pos_login_type,
  defaultLocation,
} = storeToRefs(store);

const show_forced_logout_modal = ref(false);
watch(forceLogout, () => {
  if (forceLogout.value === true) show_forced_logout_modal.value = true;
});

const LOGOUT = () => {
  show_forced_logout_modal.value = false;
  logoutForcefully();
};

const router = useRouter();
const route = useRoute();
watch(route, () => {
  isSidebarOpen.value = false; // auto-close drawer on navigation
});

const checkRouterRestrictriction = () => {
  if (
    !authenticated.value &&
    (route.fullPath != "/login" ||
      route.fullPath != "/registration" ||
      route.fullPath != "/shift-login")
  ) {
    router.push("/login");
  } else if (authenticated.value && shiftUser.value == null) {
    if (pos_login_type.value) router.push("/shift-login");
    else if (!pos_login_type.value && !defaultLocation.value)
      router.push("/home");
    else if (!pos_login_type.value && defaultLocation.value)
      router.push("/home");
  } else if (authenticated.value && shiftUser.value) {
    router.push("/home");
  }
};

watch(authenticated, checkRouterRestrictriction);
watch(shiftUser, checkRouterRestrictriction);

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);

  set_selected_customer(null);
  setForceLogout(false);
  loaded.value = true;
  setTimeout(() => {
    checkRouterRestrictriction();
    loaded.value = false;
  }, 1500);

  if (settings.value && settings.value.pos_device?.id && baseURL.value) {
    initSecondWebSocket(settings.value.pos_device.id, PACKAGE.version);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
});

watch(settings, () => {
  if (settings.value && settings.value.pos_device?.id && baseURL.value) {
    initSecondWebSocket(settings.value.pos_device.id, PACKAGE.version);
  }
});

const posConnect = ref(true);
const posWS = ref(null);
const posFailCount = ref(null);

const initSecondWebSocket = (deviceId, versionNumber) => {
  let TIME = 10000;
  if (!posWS.value || posWS.value.readyState !== WebSocket.OPEN) {
    if (posConnect.value) {
      const URL = baseURL.value.replace("https://", "").replace("/api", "");
      const socket = new WebSocket(
        `wss://${URL}/ws/pos-status/${deviceId}/?version_number=${versionNumber}`
      );
      let AKN = 0;
      let totalPages = null;
      let synced = 0;
      let syncObject = {};

      posConnect.value = false;
      posWS.value = socket;
      posFailCount.value = 0;

      socket.onopen = function () {
        AKN = 0;
        TIME = 10000;
        synced = 0;
        syncObject = {};
        totalPages = null;
        resetCustomerSync();
      };

      socket.onmessage = async function (event) {
        const acknowledge = () => {
          AKN++;
          const akn = AKN;
          syncObject = { ...syncObject, acknowledged: akn };
          updateCustomerSync(syncObject);
          socket.send(JSON.stringify({ ack: akn }));
          if (totalPages && akn === totalPages) {
            AKN = 0;
            synced = 0;
            syncObject = {};
            totalPages = null;
            resetCustomerSync({ completed: true });
          }
        };

        const message = JSON.parse(event.data);
        if (
          message.type === "sync.customers.all" &&
          message?.success === true &&
          message?.data
        ) {
          const payload = { status: true };

          if (message?.total_pages) {
            payload.totalPages = message.total_pages;
            totalPages = parseInt(message.total_pages);
          }

          if (message?.data?.store_customers?.length) {
            synced += message.data.store_customers.length;
          }

          if (message?.total_customers) {
            payload.total_customers = message.total_customers;
          }

          syncObject = { ...syncObject, synced, data: payload };
          updateCustomerSync(syncObject);

          const list = message.data.store_customers || [];
          const modifiedList = list.map((item, index) => {
            item._id = `${item?.id || index}`;
            if (item.name) item.search_name = item.name.toLowerCase();
            return item;
          });

          const deleteAll = !!message?.total_customers;
          addCustomers(modifiedList, deleteAll);
          acknowledge();
        }
      };

      socket.onclose = function () {
        posWS.value = null;
        if (posFailCount.value <= 6) {
          posConnect.value = false;
          posFailCount.value += 1;
        } else {
          TIME = 10 * 60 * 60 * 1000;
          posConnect.value = false;
        }

        setTimeout(() => {
          posConnect.value = true;
          if (!posWS.value || posWS.value.readyState !== WebSocket.OPEN) {
            initSecondWebSocket(deviceId, versionNumber);
          }
        }, 5000);
      };
    }
  } else {
    setTimeout(() => {
      if (!posWS.value || posWS.value.readyState !== WebSocket.OPEN) {
        initSecondWebSocket(deviceId, versionNumber);
      }
    }, 5000);
  }
};
</script>
