<script setup>
import { useMainStore } from "@/stores/main";
import { storeToRefs } from "pinia";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

// Pinia store and reactive refs
const store = useMainStore();
const { setDefaultLocation } = store;
const { locations, defaultLocation } = storeToRefs(store);
const selectedId = ref(null);
const router = useRouter();
// Preselect if there's an existing default
onMounted(() => {
  if (defaultLocation.value) {
    selectedId.value = defaultLocation.value.id;
  }
});

// Handlers
const selectLocation = (loc) => {
  selectedId.value = loc.id;
};

const confirmSelection = () => {
  setDefaultLocation(selectedId.value);
  router.push("/home");
};
</script>

<template>
  <div class="flex flex-col bg-white p-4">
    <!-- Header -->
    <h1 class="text-lg font-semibold mb-4">Select Your Location</h1>

    <!-- Location List -->
    <div class="flex-1 overflow-y-auto">
      <ul class="space-y-2">
        <li
          v-for="loc in locations"
          :key="loc.id"
          @click="selectLocation(loc)"
          :class="[
            'p-4 rounded-lg border cursor-pointer transition-colors',
            selectedId === loc.id
              ? 'bg-primary text-white border-primary'
              : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50',
          ]"
        >
          {{ loc.name }}
        </li>
      </ul>
    </div>

    <!-- Confirm Button -->
    <button
      class="mt-4 w-full py-3 bg-primary text-white font-medium rounded-full disabled:opacity-50"
      :disabled="selectedId === null"
      @click="confirmSelection"
    >
      Confirm
    </button>
  </div>
</template>

<style scoped>
/* Ensure scrollbar is thin on mobile */
::-webkit-scrollbar {
  width: 4px;
}
::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}
</style>
