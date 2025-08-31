<script setup>
import { ref, onMounted, computed } from 'vue'
import { useMainStore } from '@/stores/main'
import { storeToRefs } from 'pinia'

const emit = defineEmits(['phone-entered', 'cancel'])

const store = useMainStore()
const { settings } = storeToRefs(store)

const phoneNumber = ref('')
const isVisible = ref(false)

// Computed property for logo URL with fallback
const logoUrl = computed(() => {
  return settings.value?.pos_settings?.logo_url || '/jaka-bird.png'
})

const formatPhoneNumber = (value) => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '')
  
  // Format as XXX-XXX-XXXX
  if (digits.length >= 6) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`
  } else if (digits.length >= 3) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`
  }
  return digits
}

const handleInput = (event) => {
  const formatted = formatPhoneNumber(event.target.value)
  phoneNumber.value = formatted
  event.target.value = formatted
}

const addDigit = (digit) => {
  const currentDigits = phoneNumber.value.replace(/\D/g, '')
  if (currentDigits.length < 10) {
    const newValue = currentDigits + digit
    phoneNumber.value = formatPhoneNumber(newValue)
  }
}

const removeDigit = () => {
  const currentDigits = phoneNumber.value.replace(/\D/g, '')
  if (currentDigits.length > 0) {
    const newValue = currentDigits.slice(0, -1)
    phoneNumber.value = formatPhoneNumber(newValue)
  }
}

const clearAll = () => {
  phoneNumber.value = ''
}

const handleContinue = (event) => {
  if (event) {
    event.stopPropagation()
    event.preventDefault()
  }
  const digits = phoneNumber.value.replace(/\D/g, '')
  if (digits.length >= 10) {
    emit('phone-entered', phoneNumber.value)
  }
}

const handleCancel = (event) => {
  if (event) {
    event.stopPropagation()
    event.preventDefault()
  }
  emit('cancel')
}

onMounted(() => {
  setTimeout(() => {
    isVisible.value = true
  }, 100)
})
</script>

<template>
  <!-- Fullscreen Overlay with Gradient Background - Scrollable -->
  <div 
    class="fixed inset-0 z-50 bg-gradient-to-br from-primary via-secondary to-accent backdrop-blur-sm overflow-y-auto"
    :class="{ 'opacity-0': !isVisible, 'opacity-100': isVisible }"
    style="transition: opacity 0.5s ease-in-out"
  >
    <!-- Close Button -->
    <div class="absolute top-8 right-8 z-10">
      <button
        @click="handleCancel($event)"
        class="w-12 h-12 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110"
      >
        <unicon name="times" :height="24" :width="24" fill="white" />
      </button>
    </div>

    <!-- Main Content Container - Scrollable -->
    <div 
      class="min-h-screen flex items-center justify-center p-6 py-16"
      :class="{ 'scale-95 opacity-0': !isVisible, 'scale-100 opacity-100': isVisible }"
      style="transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
    >
      <div @click.stop class="bg-overlay-light backdrop-blur-xl rounded-3xl shadow-2xl max-w-lg w-full border border-white/20">
        <!-- Decorative Header -->
        <div class="relative overflow-hidden">
          <!-- Background Pattern -->
          <div class="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10"></div>
          <div class="absolute top-0 left-1/2 w-32 h-32 -translate-x-1/2 -translate-y-16 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full blur-xl"></div>
          
          <!-- Header Content -->
          <div class="relative text-center pt-12 pb-8 px-8">
            <div class="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 shadow-xl transform animate-bounce border-4 border-white/30">
              <img 
                :src="logoUrl" 
                alt="Logo" 
                class="w-12 h-12 object-contain"
                @error="$event.target.src = '/jaka-bird.png'"
              />
            </div>
            <h1 class="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-3">
              Enter Your Phone
            </h1>
            <p class="text-lg text-text-muted font-medium">
              🍽️ We'll track your delicious order
            </p>
          </div>
        </div>

        <!-- Phone Display -->
        <div class="px-8 pb-6">
          <div class="relative">
            <input
              v-model="phoneNumber"
              @input="handleInput"
              type="tel"
              placeholder="XXX-XXX-XXXX"
              class="w-full text-center text-3xl font-mono bg-white/80 backdrop-blur-sm border-3 border-primary/20 rounded-2xl py-6 px-8 focus:outline-none focus:ring-4 focus:ring-primary/30 focus:border-primary/60 transition-all duration-300 shadow-lg"
              maxlength="12"
              readonly
            />
            <div class="absolute inset-y-0 right-6 flex items-center">
              <button 
                @click="clearAll"
                v-if="phoneNumber"
                class="w-10 h-10 bg-danger/20 hover:bg-danger/30 text-danger rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110"
              >
                <unicon name="times-circle" :height="20" :width="20" fill="currentColor" />
              </button>
            </div>
          </div>
        </div>

        <!-- Enhanced Number Pad -->
        <div class="px-8 pb-8">
          <div class="grid grid-cols-3 gap-4 mb-8">
            <!-- Number buttons with gradient backgrounds -->
            <button
              v-for="digit in [1,2,3,4,5,6,7,8,9]"
              :key="digit"
              @click="addDigit(digit.toString())"
              class="aspect-square bg-gradient-to-br from-white/90 to-white/70 hover:from-primary/20 hover:to-accent/20 active:from-primary active:to-secondary active:text-white backdrop-blur-sm rounded-2xl text-2xl font-bold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg border border-white/30 hover:shadow-xl"
            >
              {{ digit }}
            </button>
            
            <!-- Special buttons bottom row -->
            <button
              @click="removeDigit"
              class="aspect-square bg-gradient-to-br from-danger/20 to-danger/10 hover:from-danger/30 hover:to-danger/20 active:from-danger active:to-danger active:text-white backdrop-blur-sm rounded-2xl flex items-center justify-center transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg border border-white/30"
            >
              <unicon name="backspace" :height="28" :width="28" fill="currentColor" />
            </button>
            
            <button
              @click="addDigit('0')"
              class="aspect-square bg-gradient-to-br from-white/90 to-white/70 hover:from-primary/20 hover:to-accent/20 active:from-primary active:to-secondary active:text-white backdrop-blur-sm rounded-2xl text-2xl font-bold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg border border-white/30 hover:shadow-xl"
            >
              0
            </button>
            
            <button
              @click="clearAll"
              class="aspect-square bg-gradient-to-br from-warning/20 to-warning/10 hover:from-warning/30 hover:to-warning/20 active:from-warning active:to-accent-dark active:text-white backdrop-blur-sm rounded-2xl flex items-center justify-center transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg border border-white/30"
            >
              <unicon name="times" :height="28" :width="28" fill="currentColor" />
            </button>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-4">
            <button
              @click="handleCancel($event)"
              class="flex-1 py-5 px-8 bg-white/80 hover:bg-white/90 backdrop-blur-sm text-text-warm font-bold rounded-2xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg border border-white/30"
            >
              ← Cancel
            </button>
            <button
              @click="handleContinue($event)"
              :disabled="phoneNumber.replace(/\D/g, '').length < 10"
              :class="[
                'flex-2 py-5 px-8 font-bold rounded-2xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg',
                phoneNumber.replace(/\D/g, '').length >= 10
                  ? 'bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary-dark text-white shadow-xl'
                  : 'bg-white/40 text-text-muted cursor-not-allowed border border-white/30'
              ]"
            >
              Continue 🚀
            </button>
          </div>
        </div>

        <!-- Enhanced Footer -->
        <div class="text-center pb-6 px-8">
          <div class="bg-success/10 backdrop-blur-sm rounded-xl p-4 border border-success/20">
            <div class="flex items-center justify-center gap-2 mb-2">
              <unicon name="shield-check" :height="20" :width="20" fill="currentColor" class="text-success" />
              <span class="text-sm font-semibold text-success">Secure & Private</span>
            </div>
            <p class="text-xs text-text-muted">
              Your phone number is encrypted and only used for order updates
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.flex-2 {
  flex: 2;
}
</style>