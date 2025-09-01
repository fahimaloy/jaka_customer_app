<script setup>
import { useMainStore } from "@/stores/main";
import { storeToRefs } from "pinia";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const store = useMainStore();
const { setDefaultLocation } = store;
const { locations, defaultLocation } = storeToRefs(store);
const selectedId = ref(null);
const router = useRouter();

onMounted(() => {
  if (defaultLocation.value) {
    selectedId.value = defaultLocation.value.id;
  }
});

const selectLocation = (loc) => {
  selectedId.value = loc.id;
};

const confirmSelection = () => {
  setDefaultLocation(selectedId.value);
  router.push("/home");
};

function initialsOf(name) {
  if (!name) return "??";
  const parts = String(name).trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() || "").join("") || "??";
}

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h = ((h ^ str.charCodeAt(i)) * 16777619) >>> 0;
  }
  return h;
}

function avatarColorFor(name) {
  const colors = [
    "bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500",
    "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-teal-500"
  ];
  const hash = hashString(name || "default");
  return colors[hash % colors.length];
}
</script>

<template>
  <div class="min-h-screen w-full bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center p-4">
    <div class="w-full max-w-4xl mx-auto">
      <!-- Header Section -->
      <div class="text-center mb-12">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-full mb-6 shadow-lg animate-bounce-in animate-pulse-glow">
          <unicon name="location-pin-alt" :height="40" :width="40" fill="white" />
        </div>
        <h1 class="text-4xl font-bold text-gray-900 mb-3 animate-bounce-in" style="animation-delay: 0.1s;">Choose Your Location</h1>
        <p class="text-xl text-gray-600 max-w-md mx-auto animate-bounce-in" style="animation-delay: 0.2s;">
          Please select the location where you'll be placing your order
        </p>
      </div>

      <!-- Location Grid - Now Scrollable -->
      <div class="max-h-96 overflow-y-auto mb-8 pr-2">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="loc in locations"
            :key="loc.id"
            @click="selectLocation(loc)"
            :class="[
              'relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer border-4 overflow-hidden',
              selectedId === loc.id
                ? 'border-primary bg-primary text-white scale-105 shadow-2xl'
                : 'border-transparent text-gray-800 hover:border-gray-200',
            ]"
          >
          <!-- Selection indicator -->
          <div
            v-if="selectedId === loc.id"
            class="absolute top-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg ring-2 ring-primary/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div class="p-8">
            <!-- Location Avatar -->
            <div 
              :class="[
                'w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mb-4 mx-auto shadow-lg',
                selectedId === loc.id ? 'bg-primary text-white' : avatarColorFor(loc.name) + ' text-white'
              ]"
            >
              {{ initialsOf(loc.name) }}
            </div>

            <!-- Location Info -->
            <div class="text-center">
              <h3 :class="['text-xl font-bold mb-2', selectedId === loc.id ? 'text-white' : 'text-gray-900']">{{ loc.name }}</h3>
              <p :class="selectedId === loc.id ? 'text-white/90' : 'text-gray-600'">
                Tap to select this location
              </p>
            </div>
          </div>

          <!-- Animated background -->
          <div 
            v-if="selectedId === loc.id"
            class="absolute inset-0 bg-gradient-to-br from-primary to-dark-primary opacity-90 -z-10"
          ></div>
          </div>
        </div>
      </div>

      <!-- Continue Button -->
      <div class="text-center">
        <button
          @click="confirmSelection"
          :disabled="selectedId === null"
          :class="[
            'inline-flex items-center gap-3 px-12 py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 animate-bounce-in',
            selectedId === null
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-primary text-white hover:bg-dark-primary active:scale-95 animate-pulse-glow hover:scale-105'
          ]"
          style="animation-delay: 0.4s;"
        >
          <unicon name="arrow-right" :height="24" :width="24" fill="currentColor" />
          Continue to Menu
        </button>
      </div>

      <!-- Footer -->
      <div class="text-center mt-12 text-gray-500">
        <p class="text-sm">
          🍽️ Welcome to our kiosk ordering system
        </p>
      </div>
    </div>
  </div>
</template>
