<template>
  <div class="h-full w-full p-4 flex flex-col bg-white rounded-md shadow">
    <div
      class="border-b grid grid-cols-3 gap-y-2 justify-between items-center py-3 px-1"
    >
      <div class="flex col-span-2 items-center gap-2">
        <unicon
          :height="32"
          :width="32"
          name="draggabledots"
          fill="black"
        ></unicon>
        <div class="text-base font-semibold">Sync All</div>
      </div>
      <button
        class="border shadow-sm rounded-md p-1 px-2"
        @click="() => sync('all')"
      >
        {{ all_sync ? "Syncing" : "Sync" }}
      </button>
    </div>
    <div
      v-for="(item, index) in items"
      :class="index != items?.length - 1 ? 'border-b' : ''"
      class="grid grid-cols-3 gap-y-2 justify-between items-center py-3 px-1"
    >
      <div class="flex col-span-2 items-center gap-2">
        <unicon
          :height="32"
          :width="32"
          :name="item.icon"
          fill="black"
        ></unicon>
        <div class="text-base font-semibold">{{ item?.label }}</div>
      </div>
      <button
        class="border shadow-sm rounded-md p-1 px-2"
        @click="() => sync(item.slug)"
      >
        {{ item?.syncing ? "Syncing" : "Sync" }}
      </button>
      <div
        v-if="syncStatus && syncStatus?.slug == item?.slug"
        class="flex flex-col w-full gap-2 pt-1 border-t col-span-3"
      >
        <div
          v-if="item?.slug != 'settings'"
          class="flex items-center justify-between"
        >
          <h3 class="text-zinc-800 font-semibold">
            Syncing <span class="animate animate-pulse">...</span>
          </h3>
          <p class="font-bold">
            <span>{{ syncStatus?.synced }}</span>
            <span>/</span>
            <span>{{ syncStatus?.total }}</span>
          </p>
        </div>
        <div class="w-full h-5 bg-gray-200 relative overflow-hidden">
          <div
            class="h-full transition-all"
            :style="{ width: `${progress}%`, backgroundColor: 'green' }"
          ></div>
        </div>
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
    label: "Customers",
    slug: "customers",
    icon: "users-alt",
    syncing: false,
  },
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
const { fetchCustomers, getItems, fetchStoreSettings, fetchFloorNTables } =
  store;
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

  // CUSTOMERS
  if (slug === "customers" || slug === "all") {
    await fetchCustomers();
    const idx = items.value.findIndex((el) => el.slug === "customers");
    items.value[idx].syncing = false;
    if (slug === "all") await delay(500);
  }

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
</script>
