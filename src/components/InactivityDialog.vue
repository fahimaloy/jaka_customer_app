<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['continue', 'cancel'])

const timeLeft = ref(5)
const isVisible = ref(false)
let countdown = null

const startCountdown = () => {
  countdown = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      handleCancel()
    }
  }, 1000)
}

const handleContinue = () => {
  if (countdown) {
    clearInterval(countdown)
    countdown = null
  }
  emit('continue')
}

const handleCancel = () => {
  if (countdown) {
    clearInterval(countdown)
    countdown = null
  }
  emit('cancel')
}

onMounted(() => {
  setTimeout(() => {
    isVisible.value = true
  }, 100)
  startCountdown()
})

onUnmounted(() => {
  if (countdown) {
    clearInterval(countdown)
  }
})
</script>

<template>
  <div 
    class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    :class="{ 'opacity-0': !isVisible, 'opacity-100': isVisible }"
    style="transition: opacity 0.3s ease-in-out"
  >
    <div 
      class="max-w-md w-full bg-white rounded-3xl shadow-2xl transform transition-all duration-300"
      :class="{ 'scale-90 opacity-0': !isVisible, 'scale-100 opacity-100': isVisible }"
    >
      <!-- Header -->
      <div class="text-center p-8 pb-4">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-full mb-4 animate-bounce-in animate-pulse-glow">
          <unicon name="clock" :height="32" :width="32" fill="white" />
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2 animate-bounce-in" style="animation-delay: 0.1s;">
          Still there?
        </h2>
        <p class="text-gray-600 animate-bounce-in" style="animation-delay: 0.2s;">
          You've been inactive for a while. Do you need more time?
        </p>
      </div>

      <!-- Countdown -->
      <div class="text-center px-8 pb-4">
        <div class="bg-orange-50 rounded-2xl p-4 mb-4 animate-bounce-in" style="animation-delay: 0.3s;">
          <div class="text-4xl font-bold text-orange-500 mb-1 animate-pulse-glow">
            {{ timeLeft }}
          </div>
          <p class="text-sm text-orange-700">seconds remaining</p>
        </div>
        <p class="text-sm text-gray-500 animate-bounce-in" style="animation-delay: 0.4s;">
          Your session will reset automatically if no response
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3 p-6 pt-0">
        <button
          @click="handleCancel"
          class="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-150 transform active:scale-95 animate-bounce-in"
          style="animation-delay: 0.5s;"
        >
          Reset Session
        </button>
        <button
          @click="handleContinue"
          class="flex-1 py-3 px-4 bg-primary hover:bg-dark-primary text-white font-semibold rounded-xl transition-all duration-150 transform active:scale-95 animate-bounce-in animate-pulse-glow"
          style="animation-delay: 0.6s;"
        >
          Continue ({{ timeLeft }}s)
        </button>
      </div>
    </div>
  </div>
</template>