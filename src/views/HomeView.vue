<!-- src/views/HomeView.vue -->

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import CategoriesList from "@/components/CategoriesList.vue";
import ItemsView from "@/components/ItemsView.vue";
import SideBar from "@/components/SideBar.vue";
import IdleSlideshow from "@/components/IdleSlideshow.vue";
import PhoneEntryModal from "@/components/PhoneEntryModal.vue";
import InactivityDialog from "@/components/InactivityDialog.vue";
import OrderConfirmationScreen from "@/components/OrderConfirmationScreen.vue";
import { useMainStore } from "@/stores/main";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";

const router = useRouter();
const store = useMainStore();
const { set_selected_customer, resetKioskState, createCustomer, clearCartOnly } = store;
const { selected_customer, cartItems } = storeToRefs(store);

const showSlideshow = ref(true) // Start with slideshow
const showPhoneEntry = ref(false)
const showInactivityDialog = ref(false)
const showOrderConfirmation = ref(false)

// Debug logging
console.log('HomeView - Initial state:', { 
  showSlideshow: showSlideshow.value, 
  showPhoneEntry: showPhoneEntry.value 
})
const orderNumber = ref('')
const orderDetails = ref({})
const idleTimer = ref(null)
const inactivityTimer = ref(null)
const customerPhone = ref('')

const INACTIVITY_TIME = 30000 // 30 seconds of inactivity
const EXTENSION_TIME = 60000 // 1 minute extension

const resetInactivityTimer = () => {
  if (inactivityTimer.value) {
    clearTimeout(inactivityTimer.value)
  }
  
  // Start inactivity timer if user is browsing (not in slideshow)
  if (!showSlideshow.value && !showInactivityDialog.value && !showOrderConfirmation.value) {
    inactivityTimer.value = setTimeout(() => {
      showInactivityDialog.value = true
    }, INACTIVITY_TIME)
  }
}

const resetToSlideshow = () => {
  // Only reset customer and cart when truly going back to slideshow (not just navigating)
  resetKioskState()
  showSlideshow.value = true
  showPhoneEntry.value = false
  showInactivityDialog.value = false
  showOrderConfirmation.value = false
  customerPhone.value = ''
  clearAllTimers()
}

const clearAllTimers = () => {
  if (idleTimer.value) {
    clearTimeout(idleTimer.value)
    idleTimer.value = null
  }
  if (inactivityTimer.value) {
    clearTimeout(inactivityTimer.value)
    inactivityTimer.value = null
  }
}

const handleUserActivity = () => {
  // Reset inactivity timer on any user activity while browsing
  if (!showSlideshow.value && !showInactivityDialog.value && !showOrderConfirmation.value) {
    resetInactivityTimer()
  }
}

const exitSlideshow = () => {
  console.log('HomeView - exitSlideshow called')
  showSlideshow.value = false
  showPhoneEntry.value = true
  resetInactivityTimer() // Start inactivity timer when exiting slideshow
}

const handlePhoneEntered = async (phone) => {
  customerPhone.value = phone
  showPhoneEntry.value = false
  
  // Try to create customer (flow continues even if this fails)
  await createCustomer(phone)
  
  // Set customer info in store
  set_selected_customer({
    phone: phone.replace(/\D/g, ''), // Store digits only
    name: phone // Display the formatted number
  })
  
  resetInactivityTimer()
}

const handlePhoneCancel = () => {
  console.log('HomeView - Phone entry cancelled, returning to slideshow')
  // Add a small delay to prevent event conflicts
  setTimeout(() => {
    resetToSlideshow()
  }, 100)
}

const handleInactivityContinue = () => {
  showInactivityDialog.value = false
  
  // Give 1 minute extension, then ask again
  if (inactivityTimer.value) {
    clearTimeout(inactivityTimer.value)
  }
  
  inactivityTimer.value = setTimeout(() => {
    showInactivityDialog.value = true
  }, EXTENSION_TIME)
}

const handleInactivityCancel = () => {
  resetToSlideshow()
}

const handleOrderComplete = (orderNum, details = {}) => {
  orderNumber.value = orderNum
  orderDetails.value = details
  showOrderConfirmation.value = true
  clearAllTimers()
}

const handleConfirmationClose = () => {
  // After order completion, clear cart but keep customer for potential future orders
  clearCartOnly()
  resetToSlideshow()
}

onMounted(() => {
  // Initialize with slideshow
  showSlideshow.value = true
  
  // Add event listeners for user activity
  document.addEventListener('mousemove', handleUserActivity, { passive: true })
  document.addEventListener('keypress', handleUserActivity, { passive: true })
  document.addEventListener('click', handleUserActivity, { passive: true })
  document.addEventListener('scroll', handleUserActivity, { passive: true })
  document.addEventListener('touchstart', handleUserActivity, { passive: true })

  // Expose order complete handler globally for checkout
  window.handleOrderComplete = handleOrderComplete
})

onUnmounted(() => {
  clearAllTimers()
  
  // Remove event listeners
  document.removeEventListener('mousemove', handleUserActivity)
  document.removeEventListener('keypress', handleUserActivity)  
  document.removeEventListener('click', handleUserActivity)
  document.removeEventListener('scroll', handleUserActivity)
  document.removeEventListener('touchstart', handleUserActivity)
  
  // Clean up global handler
  delete window.handleOrderComplete
})
</script>

<template>
  <div>
    <!-- Main Content - Only show when not in slideshow -->
    <div v-if="!showSlideshow" class="h-full w-full grid grid-cols-12 gap-2 overflow-hidden">
      <!-- Left: Categories — THIS is the ONLY scroll area for the left side -->
      <aside class="col-span-4 min-h-0 overflow-y-auto overscroll-contain">
        <CategoriesList />
      </aside>

      <!-- Right: Items — THIS is the ONLY scroll area for the right side -->
      <section class="col-span-8 min-h-0 flex flex-col overflow-hidden">
        <ItemsView class="flex-1 min-h-0" />
      </section>
    </div>

    <!-- Idle Slideshow -->
    <IdleSlideshow 
      v-if="showSlideshow" 
      @exit-slideshow="exitSlideshow"
    />

    <!-- Phone Entry Modal -->
    <PhoneEntryModal
      v-if="showPhoneEntry"
      @phone-entered="handlePhoneEntered"
      @cancel="handlePhoneCancel"
    />

    <!-- Inactivity Dialog -->
    <InactivityDialog
      v-if="showInactivityDialog"
      @continue="handleInactivityContinue"
      @cancel="handleInactivityCancel"
    />

    <!-- Order Confirmation Screen -->
    <OrderConfirmationScreen
      v-if="showOrderConfirmation"
      :orderNumber="orderNumber"
      :orderDetails="orderDetails"
      @close="handleConfirmationClose"
    />
  </div>
</template>
