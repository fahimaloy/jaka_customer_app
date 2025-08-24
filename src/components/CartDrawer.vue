<script setup lang="ts">
import { computed, defineProps, defineEmits } from 'vue'
import { IonButton } from '@ionic/vue'
import { useMainStore } from '../store/mainStore'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const store = useMainStore()

const total = computed(() =>
  store.cart.reduce((sum, c) => sum + c.item.price * c.quantity, 0)
)

function update(id: string, qty: number) {
  store.updateItemQuantity(id, qty)
}

function checkout() {
  // placeholder checkout flow
  store.clearCart()
  emit('close')
}
</script>

<template>
  <transition name="cart-slide">
    <div
      v-if="props.open"
      class="fixed inset-0 bg-black/50 flex justify-end z-50"
      @click.self="emit('close')"
    >
      <div class="w-full max-w-md bg-white h-full p-4 flex flex-col">
        <h2 class="text-2xl font-semibold mb-4">Cart</h2>
        <div class="flex-1 overflow-y-auto divide-y">
          <div
            v-for="c in store.cart"
            :key="c.item.id"
            class="py-4 flex items-center justify-between"
          >
            <div>
              <p class="font-medium">{{ c.item.name }}</p>
              <p class="text-sm text-gray-500">
                ${{ c.item.price.toFixed(2) }} × {{ c.quantity }}
              </p>
            </div>
            <div class="flex items-center gap-2">
              <button
                class="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300"
                @click="update(c.item.id, c.quantity - 1)"
                aria-label="Decrease"
              >
                -
              </button>
              <span class="w-6 text-center">{{ c.quantity }}</span>
              <button
                class="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300"
                @click="update(c.item.id, c.quantity + 1)"
                aria-label="Increase"
              >
                +
              </button>
            </div>
          </div>
          <p v-if="!store.cart.length" class="text-center text-gray-500 py-8">
            Cart is empty
          </p>
        </div>
        <div class="pt-4 border-t mt-4">
          <div class="flex justify-between mb-4 font-semibold">
            <span>Total</span>
            <span>${{ total.toFixed(2) }}</span>
          </div>
          <IonButton expand="block" class="py-3 text-lg" @click="checkout">
            Checkout
          </IonButton>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.cart-slide-enter-active,
.cart-slide-leave-active {
  transition: transform 0.3s ease;
}
.cart-slide-enter-from,
.cart-slide-leave-to {
  transform: translateX(100%);
}
</style>
