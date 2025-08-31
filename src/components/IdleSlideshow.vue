<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useMainStore } from '@/stores/main'
import { storeToRefs } from 'pinia'

const emit = defineEmits(['exit-slideshow'])

const store = useMainStore()
const { filteredItems, all_items } = storeToRefs(store)
const { filterItems } = store

const currentIndex = ref(0)
const isVisible = ref(true)
const isTransitioning = ref(false)
const touchStartX = ref(0)
const touchEndX = ref(0)
let slideInterval = null

const displayItems = computed(() => {
  const items = filteredItems.value || []
  
  // First, check if any items have slideshow: true
  const slideshowItems = items.filter(item => item.slideshow && (item.image_url || item.image))
  
  if (slideshowItems.length > 0) {
    // If there are items marked for slideshow, show only those
    return slideshowItems
  } else {
    // Otherwise, show up to 10 items with images, or any items if none have images
    const itemsWithImages = items.filter(item => item.image_url || item.image).slice(0, 10)
    
    if (itemsWithImages.length > 0) {
      return itemsWithImages
    } else {
      // If no items have images, show first 10 items anyway for slideshow
      return items.slice(0, 10)
    }
  }
})

const currentItem = computed(() => {
  return displayItems.value[currentIndex.value] || null
})

const nextSlide = () => {
  if (displayItems.value.length > 0 && !isTransitioning.value) {
    isTransitioning.value = true
    currentIndex.value = (currentIndex.value + 1) % displayItems.value.length
    setTimeout(() => {
      isTransitioning.value = false
    }, 600) // Match transition duration
  }
}

const prevSlide = () => {
  if (displayItems.value.length > 0 && !isTransitioning.value) {
    isTransitioning.value = true
    currentIndex.value = currentIndex.value === 0 
      ? displayItems.value.length - 1 
      : currentIndex.value - 1
    setTimeout(() => {
      isTransitioning.value = false
    }, 600)
  }
}

const goToSlide = (index) => {
  if (!isTransitioning.value && index !== currentIndex.value) {
    isTransitioning.value = true
    currentIndex.value = index
    setTimeout(() => {
      isTransitioning.value = false
    }, 600)
  }
}

const startSlideshow = () => {
  if (displayItems.value.length > 1) {
    slideInterval = setInterval(nextSlide, 4000) // Change slide every 4 seconds
  }
}

const stopSlideshow = () => {
  if (slideInterval) {
    clearInterval(slideInterval)
    slideInterval = null
  }
}

const handleUserInteraction = (event) => {
  // Don't exit on navigation interactions
  if (event.target.closest('.navigation-control')) {
    console.log('IdleSlideshow - Navigation interaction, not exiting')
    return
  }
  console.log('IdleSlideshow - User interaction detected, exiting slideshow')
  emit('exit-slideshow')
}

const handleTouchStart = (event) => {
  touchStartX.value = event.touches[0].clientX
}

const handleTouchEnd = (event) => {
  touchEndX.value = event.changedTouches[0].clientX
  handleSwipe()
}

const handleSwipe = () => {
  const swipeThreshold = 50
  const diff = touchStartX.value - touchEndX.value
  
  if (Math.abs(diff) > swipeThreshold) {
    if (diff > 0) {
      nextSlide()
    } else {
      prevSlide()
    }
  }
}

const initialsOf = (name) => {
  if (!name) return "??"
  const parts = String(name).trim().split(/\s+/).slice(0, 2)
  return parts.map((p) => p[0]?.toUpperCase() || "").join("") || "??"
}

const hashString = (str) => {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h = ((h ^ str.charCodeAt(i)) * 16777619) >>> 0
  }
  return h
}

const avatarColorFor = (name) => {
  const colors = [
    "from-primary to-secondary", "from-accent to-primary", 
    "from-food-orange to-food-pink", "from-tertiary to-food-purple",
    "from-success to-food-green", "from-secondary to-danger", 
    "from-food-purple to-tertiary-light", "from-warning to-accent-dark"
  ]
  const hash = hashString(name || "default")
  return colors[hash % colors.length]
}

onMounted(() => {
  console.log('IdleSlideshow - Component mounted')
  console.log('IdleSlideshow - All items:', all_items.value?.length || 0)
  console.log('IdleSlideshow - Filtered items:', filteredItems.value?.length || 0)
  console.log('IdleSlideshow - Display items on mount:', displayItems.value.length)
  
  // Ensure items are filtered first
  if (all_items.value?.length > 0 && !filteredItems.value?.length) {
    console.log('IdleSlideshow - Filtering items first')
    filterItems()
  }
  
  // Start slideshow after a short delay to ensure items are loaded
  setTimeout(() => {
    console.log('IdleSlideshow - Starting slideshow with items:', displayItems.value.length)
    startSlideshow()
  }, 500)
  
  // Add event listeners for user interaction - only clicks and touches
  document.addEventListener('click', handleUserInteraction)
  document.addEventListener('touchstart', handleUserInteraction)
})

onUnmounted(() => {
  stopSlideshow()
  document.removeEventListener('click', handleUserInteraction)
  document.removeEventListener('touchstart', handleUserInteraction)
})
</script>

<template>
  <div 
    class="fixed inset-0 z-50 bg-gradient-to-br from-primary via-accent to-secondary overflow-hidden"
    @click="handleUserInteraction"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
  >
    <!-- Dynamic Background Elements -->
    <div class="absolute inset-0">
      <!-- Animated Orbs -->
      <div class="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-tertiary/20 to-food-purple/20 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-br from-success/15 to-food-green/15 rounded-full blur-2xl animate-bounce" style="animation-duration: 3s"></div>
      <div class="absolute top-1/2 left-1/2 w-32 h-32 bg-gradient-to-br from-food-pink/25 to-warning/25 rounded-full blur-xl animate-pulse" style="animation-delay: 1s"></div>
      
      <!-- Geometric Patterns -->
      <div class="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-white/10 to-transparent rounded-full transform -translate-y-48 translate-x-48"></div>
      <div class="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-white/8 to-transparent rounded-full transform translate-y-40 -translate-x-40"></div>
    </div>

    <!-- Header with Enhanced Design -->
    <div class="absolute top-0 left-0 right-0 z-10 p-8">
      <div class="flex items-center justify-between">
        <div class="text-left">
          <!-- Welcome Message with Glass Morphism -->
          <div class="bg-white/20 backdrop-blur-xl rounded-3xl p-8 border border-white/30 shadow-2xl">
            <h1 class="text-6xl font-bold text-white drop-shadow-lg mb-4">
              🍽️ Welcome to Our Kitchen
            </h1>
            <p class="text-2xl text-white/90 font-medium">
              ✨ Touch anywhere to start your delicious journey
            </p>
          </div>
        </div>
        <div class="text-right">
          <!-- Enhanced Time Display -->
          <div class="bg-white/20 backdrop-blur-xl rounded-3xl p-8 border border-white/30 shadow-2xl">
            <div class="text-5xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent drop-shadow-sm">
              {{ new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}
            </div>
            <div class="text-lg text-white/80 font-semibold mt-2">
              {{ new Date().toLocaleDateString([], {weekday: 'long', month: 'long', day: 'numeric'}) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="flex items-center justify-center h-full pt-32 pb-16">
      <div v-if="currentItem" class="w-full max-w-7xl mx-auto px-8 relative">
        <!-- Enhanced Navigation Arrows -->
        <button
          v-if="displayItems.length > 1"
          @click="prevSlide"
          class="navigation-control absolute -left-6 top-1/2 transform -translate-y-1/2 z-20 bg-gradient-to-r from-tertiary to-food-purple hover:from-tertiary-light hover:to-food-purple text-white backdrop-blur-xl rounded-full p-6 transition-all duration-300 hover:scale-125 shadow-2xl border border-white/20"
        >
          <unicon name="angle-left" :height="36" :width="36" fill="white" />
        </button>
        
        <button
          v-if="displayItems.length > 1"
          @click="nextSlide"
          class="navigation-control absolute -right-6 top-1/2 transform -translate-y-1/2 z-20 bg-gradient-to-r from-tertiary to-food-purple hover:from-tertiary-light hover:to-food-purple text-white backdrop-blur-xl rounded-full p-6 transition-all duration-300 hover:scale-125 shadow-2xl border border-white/20"
        >
          <unicon name="angle-right" :height="36" :width="36" fill="white" />
        </button>

        <!-- Simplified Advertisement Card -->
        <div class="relative w-full max-w-5xl mx-auto">
          <!-- Main Food Advertisement -->
          <div class="relative rounded-4xl shadow-2xl overflow-hidden transform transition-all duration-700 hover:scale-[1.02]"
               :class="{ 'opacity-75 scale-95': isTransitioning }"
               style="border-radius: 3rem; min-height: 70vh;">
            
            <!-- Full Image Background -->
            <div class="relative h-full min-h-[70vh]">
              <div v-if="currentItem.image_url || currentItem.image" class="h-full relative">
                <img 
                  :src="currentItem.image_url || currentItem.image" 
                  :alt="currentItem.name"
                  class="w-full h-full object-cover"
                />
                <!-- Enhanced dark overlay for better text readability -->
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30"></div>
              </div>
              <div v-else :class="`h-full bg-gradient-to-br ${avatarColorFor(currentItem.name)} flex items-center justify-center relative overflow-hidden`">
                <!-- Background Pattern for no image -->
                <div class="absolute inset-0 opacity-20">
                  <div class="absolute top-1/4 left-1/4 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>
                  <div class="absolute bottom-1/4 right-1/4 w-48 h-48 bg-black/10 rounded-full blur-2xl"></div>
                  <div class="absolute top-3/4 left-1/2 w-32 h-32 bg-black/10 rounded-full blur-xl"></div>
                </div>
                <div class="text-[12rem] font-bold text-white drop-shadow-2xl relative z-10 opacity-30">
                  {{ initialsOf(currentItem.name) }}
                </div>
                <!-- Additional dark overlay for no-image items -->
                <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent"></div>
              </div>
              
              <!-- Centered Content Overlay -->
              <div class="absolute inset-0 flex flex-col items-center justify-center text-center p-12 z-20">
                
                <!-- Item Name - Large and Bold -->
                <h1 class="text-8xl md:text-9xl font-black text-white drop-shadow-2xl mb-8 leading-none">
                  {{ currentItem.name }}
                </h1>

                <!-- Arabic Name if available -->
                <p v-if="currentItem.arabic_name" class="text-4xl text-white/90 font-bold drop-shadow-lg mb-8 opacity-80">
                  {{ currentItem.arabic_name }}
                </p>

                <!-- Large Price Display -->
                <div class="bg-gradient-to-r from-warning via-accent to-primary text-white px-12 py-6 rounded-3xl font-black text-6xl shadow-2xl border-4 border-white/30 backdrop-blur-sm transform hover:scale-105 transition-transform duration-300">
                  ${{ (currentItem.selling_price || currentItem.price || 0).toFixed(2) }}
                </div>

                <!-- Simple Call to Action -->
                <div class="mt-12">
                  <div class="bg-white/20 backdrop-blur-xl rounded-2xl px-8 py-4 border-2 border-white/40 animate-pulse">
                    <p class="text-2xl font-bold text-white drop-shadow-lg">
                      👆 Touch to Order Now
                    </p>
                  </div>
                </div>
              </div>

              <!-- Decorative Elements -->
              <div class="absolute top-8 left-8 text-4xl animate-pulse">🔥</div>
              <div class="absolute top-8 right-8 text-4xl animate-bounce" style="animation-delay: 0.5s">✨</div>
              <div class="absolute bottom-8 left-8 text-4xl animate-pulse" style="animation-delay: 1s">🌟</div>
              <div class="absolute bottom-8 right-8 text-4xl animate-bounce" style="animation-delay: 1.5s">😋</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Enhanced Fallback when no items with images -->
      <div v-else class="text-center">
        <div class="bg-overlay-light backdrop-blur-2xl rounded-4xl p-16 shadow-2xl max-w-3xl mx-auto border border-white/30" style="border-radius: 2rem;">
          <div class="space-y-8">
            <!-- Animated Food Icons -->
            <div class="flex justify-center space-x-6 text-6xl">
              <div class="animate-bounce">🍽️</div>
              <div class="animate-bounce" style="animation-delay: 0.2s">🍕</div>
              <div class="animate-bounce" style="animation-delay: 0.4s">🍔</div>
              <div class="animate-bounce" style="animation-delay: 0.6s">🍜</div>
            </div>
            
            <h2 class="text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Amazing Food Awaits You!
            </h2>
            <p class="text-2xl text-white font-medium">
              ✨ Touch anywhere to explore our delicious menu
            </p>
            
            <!-- Pulsing Call-to-Action -->
            <div class="inline-flex items-center gap-3 bg-gradient-to-r from-success/20 to-food-green/20 px-8 py-4 rounded-2xl text-white font-bold text-xl border border-success/30 animate-pulse">
              <span class="text-2xl">👆</span>
              Tap to Begin Your Culinary Journey
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Enhanced Bottom Progress Indicator -->
    <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2">
      <div class="bg-white/20 backdrop-blur-sm rounded-full p-4 border border-white/30">
        <div class="flex space-x-3">
          <button
            v-for="(item, index) in displayItems" 
            :key="index"
            @click="goToSlide(index)"
            class="navigation-control transition-all duration-300 hover:scale-150"
            :class="[
              'w-4 h-4 rounded-full',
              index === currentIndex 
                ? 'bg-gradient-to-r from-primary to-secondary scale-150 shadow-lg' 
                : 'bg-white/60 hover:bg-white/80 hover:shadow-md'
            ]"
          ></button>
        </div>
      </div>
    </div>

    <!-- Enhanced Touch/Click Hint -->
    <div class="absolute bottom-16 right-8 animate-float">
      <div class="bg-gradient-to-r from-tertiary/30 to-food-purple/30 backdrop-blur-xl rounded-full p-6 shadow-2xl hover:scale-125 transition-all duration-300 cursor-pointer border border-white/20">
        <unicon name="hand-point-up" :height="36" :width="36" fill="white" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Enhanced Animations */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

@keyframes pulse-glow {
  0%, 100% { 
    box-shadow: 0 0 20px rgba(255, 107, 53, 0.3);
  }
  50% { 
    box-shadow: 0 0 40px rgba(255, 107, 53, 0.6), 0 0 60px rgba(255, 181, 42, 0.4);
  }
}

@keyframes bounce-in {
  0% { 
    opacity: 0;
    transform: scale(0.3) translateY(50px);
  }
  50% { 
    opacity: 1;
    transform: scale(1.05);
  }
  70% { 
    transform: scale(0.9);
  }
  100% { 
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animate-pulse-glow {
  animation: pulse-glow 3s ease-in-out infinite;
}

.animate-bounce-in {
  animation: bounce-in 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

.animate-shimmer {
  background-size: 400% 100%;
  animation: shimmer 3s ease-in-out infinite;
}

/* Navigation Controls Enhancement */
.navigation-control {
  backdrop-filter: blur(20px);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.navigation-control:hover {
  transform: scale(1.1);
  filter: brightness(1.2);
}

/* Gradient Text Animation */
.gradient-text-animated {
  background: linear-gradient(45deg, #FF6B35, #FFB52A, #FF4757, #6C5CE7, #00D4AA);
  background-size: 400% 400%;
  animation: gradientShift 4s ease infinite;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
</style>