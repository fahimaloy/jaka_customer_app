<template>
  <div class="fixed inset-0 z-[60] flex items-end justify-center bg-gradient-to-br from-overlay-dark/80 via-bg-warm/40 to-primary/20 backdrop-blur-md p-4 md:items-center">
    <div class="relative w-full max-w-4xl bg-white/95 backdrop-blur-sm rounded-t-3xl md:rounded-3xl shadow-2xl border border-primary/20 overflow-hidden transform animate-slide-up md:animate-bounce-in">
      <!-- Header -->
      <div class="p-4 pb-3 bg-gradient-to-br from-primary/10 via-bg-warm to-accent/5 border-b border-primary/20 text-center">
        <h3 class="text-lg font-extrabold text-text-warm">{{ title }}</h3>
        <p class="text-xs text-text-muted mt-1">{{ placeholder || 'Type your message' }}</p>
      </div>

      <!-- Text Display -->
      <div class="p-4 bg-gradient-to-r from-bg-warm to-bg-light border-b border-primary/20">
        <div class="bg-white rounded-2xl border border-primary/20 p-4 min-h-[80px] max-h-32 overflow-y-auto">
          <div class="text-sm text-text-warm whitespace-pre-wrap break-words leading-relaxed">
            {{ displayText }}<span class="animate-pulse">|</span>
          </div>
        </div>
      </div>

      <!-- Keyboard -->
      <div class="p-4 space-y-3">
        <!-- First row: QWERTYUIOP -->
        <div class="flex gap-1 justify-center">
          <button
            v-for="key in firstRow"
            :key="key"
            @click="addChar(key)"
            class="key-btn"
            :class="{ 'uppercase': isShifted }"
          >
            {{ isShifted ? key.toUpperCase() : key }}
          </button>
        </div>

        <!-- Second row: ASDFGHJKL -->
        <div class="flex gap-1 justify-center">
          <button
            v-for="key in secondRow"
            :key="key"
            @click="addChar(key)"
            class="key-btn"
            :class="{ 'uppercase': isShifted }"
          >
            {{ isShifted ? key.toUpperCase() : key }}
          </button>
        </div>

        <!-- Third row: Shift + ZXCVBNM + Backspace -->
        <div class="flex gap-1 justify-center">
          <button
            @click="toggleShift"
            class="key-btn-wide"
            :class="{ 'bg-gradient-to-r from-primary to-secondary text-white': isShifted }"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L22 9H17V20H7V9H2L12 2Z" stroke="currentColor" stroke-width="2" fill="currentColor"/>
            </svg>
          </button>
          
          <button
            v-for="key in thirdRow"
            :key="key"
            @click="addChar(key)"
            class="key-btn"
            :class="{ 'uppercase': isShifted }"
          >
            {{ isShifted ? key.toUpperCase() : key }}
          </button>
          
          <button
            @click="backspace"
            class="key-btn-wide bg-gradient-to-r from-danger to-secondary hover:from-danger hover:to-secondary-dark text-white shadow-xl"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none">
              <path d="M22 3H7c-.69 0-1.32.34-1.71.88L.88 9.71c-.39.52-.39 1.3 0 1.82l4.41 5.83c.39.54 1.02.88 1.71.88H22c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" stroke="currentColor" stroke-width="2" fill="currentColor" opacity="0.2"/>
              <path d="m18 9-6 6M12 9l6 6" stroke="currentColor" stroke-width="2.5"/>
            </svg>
          </button>
        </div>

        <!-- Fourth row: Numbers and symbols -->
        <div class="flex gap-1 justify-center">
          <button
            v-for="key in numberRow"
            :key="key"
            @click="addChar(key)"
            class="key-btn-sm"
          >
            {{ key }}
          </button>
        </div>

        <!-- Fifth row: Space, punctuation, etc -->
        <div class="flex gap-1 justify-center">
          <button
            @click="addChar(',')"
            class="key-btn"
          >
            ,
          </button>
          <button
            @click="addChar(' ')"
            class="key-btn-space"
          >
            Space
          </button>
          <button
            @click="addChar('.')"
            class="key-btn"
          >
            .
          </button>
          <button
            @click="clear"
            class="key-btn-wide bg-gradient-to-r from-danger to-secondary hover:from-danger hover:to-secondary-dark text-white font-extrabold shadow-xl"
          >
            Clear
          </button>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3 pt-2">
          <button
            @click="close"
            class="flex-1 h-12 rounded-2xl bg-white hover:bg-gray-50 border-2 border-primary/30 hover:border-primary/50 text-text-muted hover:text-text-warm font-bold text-sm active:translate-y-[1px] transition-all duration-300"
          >
            Cancel
          </button>
          <button
            @click="confirm"
            class="flex-1 h-12 rounded-2xl bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary-dark text-white font-extrabold text-sm shadow-lg hover:shadow-xl active:translate-y-[1px] transition-all duration-300 animate-pulse-glow"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  value: { type: String, default: '' },
  title: { type: String, default: 'Enter Text' },
  placeholder: { type: String, default: 'Type your message' }
})

const emit = defineEmits(['update:value', 'close'])

const currentText = ref(props.value || '')
const isShifted = ref(false)

// Keyboard layout
const firstRow = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p']
const secondRow = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l']
const thirdRow = ['z', 'x', 'c', 'v', 'b', 'n', 'm']
const numberRow = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']

const displayText = computed(() => {
  return currentText.value || ''
})

const addChar = (char) => {
  const finalChar = isShifted.value && char.match(/[a-z]/) ? char.toUpperCase() : char
  currentText.value += finalChar
  
  // Auto turn off shift after typing a letter
  if (isShifted.value && char.match(/[a-z]/)) {
    isShifted.value = false
  }
}

const backspace = () => {
  currentText.value = currentText.value.slice(0, -1)
}

const clear = () => {
  currentText.value = ''
}

const toggleShift = () => {
  isShifted.value = !isShifted.value
}

const close = () => {
  emit('close')
}

const confirm = () => {
  emit('update:value', currentText.value)
  emit('close')
}
</script>

<style scoped>
/* Key button styles */
.key-btn {
  @apply w-12 h-12 rounded-xl bg-white hover:bg-gray-50 border-2 border-primary/30 hover:border-primary/50 text-lg font-bold text-text-warm shadow-lg hover:shadow-xl active:translate-y-[1px] transition-all duration-200 flex items-center justify-center;
}

.key-btn-sm {
  @apply w-10 h-10 rounded-lg bg-white hover:bg-gray-50 border-2 border-primary/30 hover:border-primary/50 text-sm font-bold text-text-warm shadow-lg hover:shadow-xl active:translate-y-[1px] transition-all duration-200 flex items-center justify-center;
}

.key-btn-wide {
  @apply w-16 h-12 rounded-xl bg-gradient-to-r from-text-muted to-text-warm hover:from-text-warm hover:to-text-muted text-white font-bold shadow-lg hover:shadow-xl active:translate-y-[1px] transition-all duration-200 flex items-center justify-center border-2 border-transparent;
}

.key-btn-space {
  @apply flex-1 h-12 rounded-xl bg-white hover:bg-gray-50 border-2 border-primary/30 hover:border-primary/50 text-base font-bold text-text-warm shadow-lg hover:shadow-xl active:translate-y-[1px] transition-all duration-200 flex items-center justify-center max-w-40;
}

.uppercase {
  @apply bg-gradient-to-r from-accent/20 to-warning/20;
}

/* Custom animations */
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

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}

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