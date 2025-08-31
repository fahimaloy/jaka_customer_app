<script setup>
import { useMainStore } from "@/stores/main";
import { storeToRefs } from "pinia";
const props = defineProps({
  message: {
    type: String,
    required: true,
    default: "",
  },
  show_progress: {
    type: Boolean,
    default: false,
  },
  hideLogo: {
    type: Boolean,
    default: false,
  },
});
const store = useMainStore();
const { syncStatus } = storeToRefs(store);
</script>
<template>
  <!-- Dynamic Gradient Background -->
  <div class="fixed inset-0 bg-gradient-to-br from-primary via-accent to-secondary overflow-hidden">
    <!-- Animated Background Elements -->
    <div class="absolute inset-0">
      <!-- Floating Orbs -->
      <div class="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-food-orange/30 to-food-pink/30 rounded-full blur-xl animate-pulse"></div>
      <div class="absolute top-3/4 right-1/4 w-24 h-24 bg-gradient-to-br from-tertiary/20 to-food-purple/20 rounded-full blur-lg animate-bounce"></div>
      <div class="absolute bottom-1/4 left-1/3 w-20 h-20 bg-gradient-to-br from-success/25 to-food-green/25 rounded-full blur-md animate-pulse" style="animation-delay: 0.5s"></div>
      
      <!-- Geometric Patterns -->
      <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/10 to-transparent rounded-full transform -translate-y-32 translate-x-32"></div>
      <div class="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-white/5 to-transparent rounded-full transform translate-y-48 -translate-x-48"></div>
    </div>

    <!-- Main Content -->
    <div class="relative z-10 h-full flex flex-col">
      <!-- Logo Section -->
      <div v-if="!hideLogo" class="flex-1 flex items-center justify-center pt-16">
        <div class="transform hover:scale-105 transition-transform duration-500">
          <!-- Logo Container with Glass Effect -->
          <div class="relative">
            <div class="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-3xl transform rotate-6"></div>
            <div class="relative bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/30">
              <img src="/jaka-logo.png" class="h-28 w-auto object-contain filter drop-shadow-lg" />
            </div>
          </div>
        </div>
      </div>

      <!-- Message Section -->
      <div class="flex-1 flex flex-col items-center justify-center space-y-8 px-8">
        <!-- Status Message -->
        <div class="text-center space-y-4">
          <div v-if="message && !show_progress" class="animate-pulse">
            <div class="bg-white/20 backdrop-blur-sm rounded-2xl px-8 py-4 border border-white/30">
              <p class="text-2xl font-bold text-white drop-shadow-sm">
                {{ message }}
              </p>
            </div>
          </div>
          
          <div v-else-if="show_progress" class="space-y-3">
            <div class="bg-white/20 backdrop-blur-sm rounded-2xl px-8 py-4 border border-white/30">
              <p class="text-2xl font-bold text-white drop-shadow-sm mb-2">
                {{ message }}
              </p>
              <div v-if="!syncStatus?.completed" class="space-y-2">
                <p class="text-lg font-semibold text-white/90">
                  {{ syncStatus.synced }}/{{ syncStatus.total }}
                </p>
                <!-- Progress Bar -->
                <div class="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                  <div 
                    class="bg-gradient-to-r from-success to-success-light h-full rounded-full transition-all duration-500 ease-out shadow-lg"
                    :style="{ width: syncStatus.total !== '∞' ? (syncStatus.synced / syncStatus.total * 100) + '%' : '100%' }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Enhanced Loader -->
        <div class="relative">
          <div class="loader-glow"></div>
          <div class="loader"></div>
        </div>

        <!-- Fun Loading Messages -->
        <div class="text-center">
          <div class="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/20">
            <p class="text-white/80 text-sm font-medium">
              🍽️ Preparing your delicious experience...
            </p>
          </div>
        </div>
      </div>

      <!-- Bottom Decoration -->
      <div class="flex-shrink-0 pb-8">
        <div class="flex justify-center space-x-2">
          <div class="w-3 h-3 bg-white/40 rounded-full animate-bounce"></div>
          <div class="w-3 h-3 bg-white/40 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
          <div class="w-3 h-3 bg-white/40 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
        </div>
      </div>
    </div>
  </div>
</template>
<!-- <style scoped>
.loader {
  --d: 20px;
  width: 2px;
  height: 2px;
  border-radius: 50%;
  /* color: #22b453; */
  color: #475569;
  box-shadow: calc(1 * var(--d)) calc(0 * var(--d)) 0 0,
    calc(0.707 * var(--d)) calc(0.707 * var(--d)) 0 1px,
    calc(0 * var(--d)) calc(1 * var(--d)) 0 2px,
    calc(-0.707 * var(--d)) calc(0.707 * var(--d)) 0 3px,
    calc(-1 * var(--d)) calc(0 * var(--d)) 0 4px,
    calc(-0.707 * var(--d)) calc(-0.707 * var(--d)) 0 5px,
    calc(0 * var(--d)) calc(-1 * var(--d)) 0 6px;
  animation: l27 1s infinite steps(8);
}
@keyframes l27 {
  100% {
    transform: rotate(1turn);
  }
}
</style> -->
<style scoped>
/* Enhanced Vibrant Loader */
.loader {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  position: relative;
  background: conic-gradient(
    from 0deg,
    #FF6B35,
    #FFB52A,
    #FF4757,
    #6C5CE7,
    #00D4AA,
    #FF6B35
  );
  animation: spin 1.5s linear infinite;
}

.loader::before {
  content: '';
  position: absolute;
  inset: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}

.loader::after {
  content: '🍽️';
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  z-index: 1;
}

.loader-glow {
  position: absolute;
  inset: -10px;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    #FF6B35,
    #FFB52A,
    #FF4757,
    #6C5CE7,
    #00D4AA,
    #FF6B35
  );
  opacity: 0.3;
  filter: blur(20px);
  animation: spin 2s linear infinite reverse;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Additional Animations */
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes glow {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}
</style>
