<template>
  <div class="h-full w-full bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 overflow-hidden">
    <div class="h-full flex flex-col">
      <!-- Header -->
      <div class="shrink-0 p-6 bg-white/80 backdrop-blur-sm border-b border-orange-200">
        <div class="max-w-2xl mx-auto">
          <div class="flex items-center gap-4 mb-4">
            <div class="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
              <unicon name="sync" :height="32" :width="32" fill="white" />
            </div>
            <div>
              <h1 class="text-3xl font-bold text-gray-900">Data Sync</h1>
              <p class="text-gray-600">Synchronize your data with the server</p>
            </div>
          </div>

          <!-- Sync All Button -->
          <button
            @click="() => sync('all')"
            :disabled="all_sync"
            class="w-full p-4 bg-primary hover:bg-dark-primary disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 active:scale-95"
          >
            <div class="flex items-center justify-center gap-3">
              <unicon 
                :name="all_sync ? 'spinner' : 'cloud-download'" 
                :height="24" 
                :width="24" 
                fill="currentColor"
                :class="{ 'animate-spin': all_sync }"
              />
              {{ all_sync ? "Syncing All Data..." : "Sync All Data" }}
            </div>
          </button>
        </div>
      </div>

      <!-- Scrollable Content -->
      <div class="flex-1 overflow-y-auto p-6">
        <div class="max-w-2xl mx-auto space-y-4">
          <div
            v-for="(item, index) in items"
            :key="item.slug"
            class="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden transform hover:scale-105 transition-all duration-300 hover:shadow-xl"
          >
            <!-- Main Item Row -->
            <div class="p-6">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 bg-gradient-to-br from-primary to-dark-primary rounded-xl flex items-center justify-center shadow-md">
                    <unicon
                      :height="24"
                      :width="24"
                      :name="item.icon"
                      fill="white"
                    />
                  </div>
                  <div>
                    <h3 class="text-lg font-bold text-gray-900">{{ item?.label }}</h3>
                    <p class="text-sm text-gray-500">Sync {{ item?.label?.toLowerCase() }} data</p>
                  </div>
                </div>
                <button
                  @click="() => sync(item.slug)"
                  :disabled="item?.syncing"
                  class="px-6 py-3 bg-primary hover:bg-dark-primary disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 active:scale-95"
                >
                  <div class="flex items-center gap-2">
                    <unicon 
                      :name="item?.syncing ? 'spinner' : 'sync'" 
                      :height="16" 
                      :width="16" 
                      fill="currentColor"
                      :class="{ 'animate-spin': item?.syncing }"
                    />
                    {{ item?.syncing ? "Syncing" : "Sync" }}
                  </div>
                </button>
              </div>

              <!-- Progress Section -->
              <div
                v-if="syncStatus && syncStatus?.slug == item?.slug"
                class="mt-6 p-4 bg-gray-50 rounded-xl border"
              >
                <div
                  v-if="item?.slug != 'settings'"
                  class="flex items-center justify-between mb-3"
                >
                  <div class="flex items-center gap-2">
                    <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span class="text-gray-800 font-semibold">Syncing data...</span>
                  </div>
                  <div class="text-primary font-bold">
                    {{ syncStatus?.synced }}/{{ syncStatus?.total }}
                  </div>
                </div>
                
                <!-- Progress Bar -->
                <div class="w-full h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                  <div
                    class="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-300 ease-out shadow-sm"
                    :style="{ width: `${progress}%` }"
                  ></div>
                </div>
                
                <div class="flex justify-between items-center mt-2 text-xs text-gray-600">
                  <span>Progress</span>
                  <span>{{ Math.round(progress) }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Space -->
        <div class="h-6"></div>
      </div>
    </div>

  </div>
</template>
<script setup>
import { ref, computed } from "vue";
import { useMainStore } from "@/stores/main";
import { storeToRefs } from "pinia";
const items = ref([
  {
    label: "Items",
    slug: "items",
    icon: "list-ul",
    syncing: false,
  },
  {
    label: "Settings",
    slug: "settings",
    icon: "setting",
    syncing: false,
  },
  {
    label: "Tables",
    slug: "tables",
    icon: "database-alt",
    syncing: false,
  },
]);
const store = useMainStore();
const { syncStatus } = storeToRefs(store);
const { getItems, fetchStoreSettings, fetchFloorNTables } = store;
const progress = computed(() => {
  console.log(syncStatus.value);
  if (!syncStatus.value?.completed) {
    try {
      const synced = parseInt(syncStatus.value?.synced);
      if (syncStatus.value?.total == "∞") {
        return 0;
      }
      const total = parseInt(syncStatus.value?.total);

      return (synced / total) * 100;
    } catch (e) {
      return 0;
    }
  } else {
    return 100;
  }
});
const all_sync = ref(false);

const doSync = async (slug) => {
  const delay = (ms) => new Promise((r) => setTimeout(r, ms));

  if (slug === "all") {
    all_sync.value = true;
    items.value = items.value.map((item) => {
      item.syncing = true;
      return item;
    });
  } else {
    const itemIndex = items.value.findIndex((el) => el.slug === slug);
    items.value[itemIndex].syncing = true;
  }

  // Skip customer sync for kiosk mode

  // ITEMS
  if (slug === "items" || slug === "all") {
    await getItems();
    const idx = items.value.findIndex((el) => el.slug === "items");
    items.value[idx].syncing = false;
    if (slug === "all") await delay(500);
  }

  // SETTINGS
  if (slug === "settings" || slug === "all") {
    await fetchStoreSettings();
    const idx = items.value.findIndex((el) => el.slug === "settings");
    items.value[idx].syncing = false;
    if (slug === "all") await delay(500);
  }

  // TABLES
  if (slug === "tables" || slug === "all") {
    await fetchFloorNTables();
    const idx = items.value.findIndex((el) => el.slug === "tables");
    items.value[idx].syncing = false;
  }

  // finally turn off the “all” spinner
  if (slug === "all") {
    await delay(500);
    all_sync.value = false;
  }
};

// expose it globally so native can call it:
window.sync = doSync
const sync = doSync;

// Customer sync removed for kiosk mode
</script>
