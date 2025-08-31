<template>
  <div class="fixed inset-0 z-[60] flex items-center justify-center bg-gradient-to-br from-overlay-dark/80 via-bg-warm/40 to-primary/20 backdrop-blur-md p-4">
    <div class="relative w-full max-w-sm bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-primary/20 overflow-hidden transform animate-bounce-in">
      <!-- Header -->
      <div class="p-6 pb-4 bg-gradient-to-br from-primary/10 via-bg-warm to-accent/5 border-b border-primary/20 text-center">
        <h3 class="text-xl font-extrabold text-text-warm">{{ title }}</h3>
        <p class="text-sm text-text-muted mt-1">Tap numbers to enter value</p>
      </div>

      <!-- Display -->
      <div class="p-4 bg-gradient-to-r from-bg-warm to-bg-light border-b border-primary/20">
        <div class="text-center">
          <div class="text-3xl font-extrabold text-text-warm mb-2">
            {{ displayValue }}
          </div>
          <div class="text-xs text-text-muted">
            {{ min !== undefined ? `Min: ${min}` : '' }}
            {{ max !== undefined ? ` • Max: ${max}` : '' }}
          </div>
        </div>
      </div>

      <!-- Numpad -->
      <div class="p-6">
        <div class="grid grid-cols-3 gap-3">
          <!-- Numbers 1-9 -->
          <button
            v-for="num in [1,2,3,4,5,6,7,8,9]"
            :key="num"
            @click="addDigit(num)"
            class="aspect-square rounded-2xl bg-white hover:bg-gray-50 border-2 border-primary/30 hover:border-primary/50 text-2xl font-bold text-text-warm shadow-sm hover:shadow-md active:translate-y-[1px] transition-all duration-200"
          >
            {{ num }}
          </button>

          <!-- Bottom row: Clear, 0, Backspace -->
          <button
            @click="clear"
            class="aspect-square rounded-2xl bg-gradient-to-r from-danger to-danger hover:from-danger hover:to-secondary-dark text-white text-sm font-bold shadow-lg hover:shadow-xl active:translate-y-[1px] transition-all duration-200"
          >
            C
          </button>
          
          <button
            @click="addDigit(0)"
            class="aspect-square rounded-2xl bg-white hover:bg-gray-50 border-2 border-primary/30 hover:border-primary/50 text-2xl font-bold text-text-warm shadow-sm hover:shadow-md active:translate-y-[1px] transition-all duration-200"
          >
            0
          </button>
          
          <button
            @click="backspace"
            class="aspect-square rounded-2xl bg-gradient-to-r from-text-muted to-text-warm hover:from-text-warm hover:to-text-muted text-white shadow-lg hover:shadow-xl active:translate-y-[1px] transition-all duration-200 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none">
              <path d="M22 3H7c-.69 0-1.32.34-1.71.88L.88 9.71c-.39.52-.39 1.3 0 1.82l4.41 5.83c.39.54 1.02.88 1.71.88H22c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" stroke="currentColor" stroke-width="2"/>
              <path d="m18 9-6 6M12 9l6 6" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3 mt-6">
          <button
            @click="close"
            class="flex-1 h-14 rounded-2xl bg-white hover:bg-gray-50 border-2 border-primary/30 hover:border-primary/50 text-text-muted hover:text-text-warm font-bold text-base active:translate-y-[1px] transition-all duration-300"
          >
            Cancel
          </button>
          <button
            @click="confirm"
            :disabled="!isValid"
            class="flex-1 h-14 rounded-2xl bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary-dark text-white font-extrabold text-base shadow-lg hover:shadow-xl active:translate-y-[1px] transition-all duration-300 animate-pulse-glow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  value: { type: Number, default: 0 },
  title: { type: String, default: 'Enter Number' },
  min: { type: Number, default: undefined },
  max: { type: Number, default: undefined }
})

const emit = defineEmits(['update:value', 'close'])

const currentValue = ref('')

// Initialize with current value
watch(() => props.value, (newVal) => {
  if (newVal !== undefined && newVal !== null) {
    currentValue.value = String(newVal)
  }
}, { immediate: true })

const displayValue = computed(() => {
  return currentValue.value || '0'
})

const numericValue = computed(() => {
  const val = parseInt(currentValue.value) || 0
  return val
})

const isValid = computed(() => {
  const val = numericValue.value
  if (props.min !== undefined && val < props.min) return false
  if (props.max !== undefined && val > props.max) return false
  return val > 0
})

const addDigit = (digit) => {
  if (currentValue.value === '0') {
    currentValue.value = String(digit)
  } else {
    const newValue = currentValue.value + String(digit)
    const numVal = parseInt(newValue)
    
    // Check max limit
    if (props.max !== undefined && numVal > props.max) {
      return // Don't add if exceeds max
    }
    
    currentValue.value = newValue
  }
}

const backspace = () => {
  if (currentValue.value.length > 1) {
    currentValue.value = currentValue.value.slice(0, -1)
  } else {
    currentValue.value = '0'
  }
}

const clear = () => {
  currentValue.value = '0'
}

const close = () => {
  emit('close')
}

const confirm = () => {
  if (isValid.value) {
    emit('update:value', numericValue.value)
    emit('close')
  }
}

// Keyboard support
const handleKeydown = (e) => {
  if (e.key >= '0' && e.key <= '9') {
    e.preventDefault()
    addDigit(parseInt(e.key))
  } else if (e.key === 'Backspace') {
    e.preventDefault()
    backspace()
  } else if (e.key === 'Enter') {
    e.preventDefault()
    confirm()
  } else if (e.key === 'Escape') {
    e.preventDefault()
    close()
  } else if (e.key === 'c' || e.key === 'C') {
    e.preventDefault()
    clear()
  }
}

// Add keyboard listener
import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
/* Custom pulse glow animation */
@keyframes pulse-glow {
  0%, 100% { 
    box-shadow: 0 0 0 0 rgba(255, 107, 53, 0.4);
  }
  50% { 
    box-shadow: 0 0 0 10px rgba(255, 107, 53, 0);
  }
}

.animate-pulse-glow {
  animation: pulse-glow 2s infinite;
}

/* Bounce in animation */
@keyframes bounce-in {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-bounce-in {
  animation: bounce-in 0.5s ease-out;
}
</style>