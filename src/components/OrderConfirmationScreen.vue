<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['close'])
const props = defineProps({
  orderNumber: {
    type: String,
    default: '#1234'
  },
  orderDetails: {
    type: Object,
    default: () => ({})
  }
})

const timeLeft = ref(10)
const isVisible = ref(false)
let countdown = null

const startCountdown = () => {
  countdown = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      handleClose()
    }
  }, 1000)
}

const handleClose = () => {
  if (countdown) {
    clearInterval(countdown)
    countdown = null
  }
  emit('close')
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
    class="fixed inset-0 z-50 bg-gradient-to-br from-bg-warm via-bg-light to-success/10 flex items-center justify-center p-4"
    :class="{ 'opacity-0': !isVisible, 'opacity-100': isVisible }"
    style="transition: opacity 0.5s ease-in-out"
  >
    <div 
      class="max-w-2xl w-full bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center transform transition-all duration-500"
      :class="{ 'scale-90 opacity-0': !isVisible, 'scale-100 opacity-100': isVisible }"
    >
      <!-- Success Icon -->
      <div class="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-success to-food-green rounded-full mb-6 animate-bounce-in animate-pulse-glow shadow-2xl">
        <unicon name="check" :height="48" :width="48" fill="white" />
      </div>

      <!-- Success Message -->
      <h1 class="text-4xl font-bold text-text-warm mb-4 animate-bounce-in" style="animation-delay: 0.1s;">
        🎉 Order Confirmed!
      </h1>
      
      <p class="text-xl text-text-muted mb-2 animate-bounce-in" style="animation-delay: 0.2s;">
        Your order {{ orderNumber }} has been successfully placed
      </p>
      
      <p class="text-lg text-text-muted mb-6 animate-bounce-in" style="animation-delay: 0.3s;">
        Thank you for choosing us! Your delicious meal will be prepared shortly.
      </p>

      <!-- Order Details -->
      <div v-if="orderDetails.ptid || orderDetails.invoice_num || orderDetails.total_payable_amount" class="bg-white/90 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-primary/20 shadow-lg animate-bounce-in" style="animation-delay: 0.35s;">
        <h3 class="text-lg font-bold text-text-warm mb-4 flex items-center gap-2">
          📋 Order Details
        </h3>
        <div class="space-y-3">
          <div v-if="orderDetails.ptid" class="flex justify-between items-center">
            <span class="text-text-muted font-medium">Order ID:</span>
            <span class="text-text-warm font-bold">{{ orderDetails.ptid }}</span>
          </div>
          <div v-if="orderDetails.invoice_num" class="flex justify-between items-center">
            <span class="text-text-muted font-medium">Invoice:</span>
            <span class="text-text-warm font-bold">{{ orderDetails.invoice_num }}</span>
          </div>
          <div v-if="orderDetails.total_payable_amount" class="flex justify-between items-center pt-2 border-t border-primary/20">
            <span class="text-text-muted font-medium">Total Amount:</span>
            <span class="text-2xl font-extrabold text-primary">SAR {{ orderDetails.total_payable_amount }}</span>
          </div>
          <div v-if="orderDetails.business_date" class="flex justify-between items-center">
            <span class="text-text-muted font-medium">Date:</span>
            <span class="text-text-warm font-semibold">{{ orderDetails.business_date }}</span>
          </div>
        </div>
      </div>

      <!-- Countdown Timer -->
      <div class="bg-primary/10 rounded-2xl p-6 mb-8 animate-bounce-in" style="animation-delay: 0.4s;">
        <div class="text-6xl font-bold text-primary mb-2 animate-pulse-glow">
          {{ timeLeft }}
        </div>
        <p class="text-text-muted">This screen will close automatically</p>
      </div>

      <!-- Farewell Message -->
      <div class="space-y-4 mb-8 animate-bounce-in" style="animation-delay: 0.5s;">
        <p class="text-2xl font-semibold text-text-warm">
          👋 Have a wonderful day!
        </p>
        <p class="text-lg text-text-muted">
          We hope you enjoy your meal. See you again soon!
        </p>
      </div>

      <!-- Close Button -->
      <button
        @click="handleClose"
        class="bg-primary hover:bg-dark-primary text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 active:scale-95 animate-bounce-in animate-pulse-glow"
        style="animation-delay: 0.6s;"
      >
        <div class="flex items-center gap-3">
          <unicon name="times" :height="24" :width="24" fill="currentColor" />
          Close ({{ timeLeft }}s)
        </div>
      </button>
    </div>

    <!-- Decorative Elements -->
    <div class="absolute top-10 left-10 animate-float">
      <div class="text-6xl opacity-20">🍔</div>
    </div>
    <div class="absolute top-20 right-20 animate-float" style="animation-delay: 0.5s;">
      <div class="text-5xl opacity-20">🍕</div>
    </div>
    <div class="absolute bottom-20 left-20 animate-float" style="animation-delay: 1s;">
      <div class="text-4xl opacity-20">🥗</div>
    </div>
    <div class="absolute bottom-10 right-10 animate-float" style="animation-delay: 1.5s;">
      <div class="text-5xl opacity-20">🍰</div>
    </div>
  </div>
</template>

<style scoped>
@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}
</style>