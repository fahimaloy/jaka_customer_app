<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonIcon
} from '@ionic/vue'
import { cartOutline } from 'ionicons/icons'
import CategoryList from '../components/CategoryList.vue'
import ItemGrid from '../components/ItemGrid.vue'
import CartDrawer from '../components/CartDrawer.vue'
import { useMainStore } from '../store/mainStore'
import type { Item } from '../lib/db'

type ItemWithImage = Item & { image_link?: string; category_id?: string; category?: string }
interface Category { id: string; name: string }

const store = useMainStore()
const selected = ref<string | null>(null)
const cartOpen = ref(false)

const categories = computed(() => (store.categories as Category[]) || [])
const items = computed<ItemWithImage[]>(() => {
  const list = store.items as ItemWithImage[]
  if (!selected.value) return list
  return list.filter(
    (i) => i.category_id === selected.value || i.category === selected.value
  )
})
const cartCount = computed(() =>
  store.cart.reduce((sum, c) => sum + c.quantity, 0)
)

function handleSelect(id: string | null) {
  selected.value = id
}
function handleAdd(item: ItemWithImage) {
  store.addToCart(item)
}
</script>

<template>
  <IonPage class="kiosk-theme">
    <IonHeader>
      <IonToolbar class="bg-yellow-200 flex items-center justify-between px-4">
        <div class="flex items-center gap-2">
          <img src="/logo-placeholder.svg" alt="logo" class="h-10 w-10" />
          <IonTitle class="text-2xl font-bold">Menu</IonTitle>
        </div>
        <IonButton fill="clear" @click="cartOpen = true" class="relative">
          <IonIcon :icon="cartOutline" class="text-3xl" />
          <span
            v-if="cartCount"
            class="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center"
            >{{ cartCount }}</span
          >
        </IonButton>
      </IonToolbar>
    </IonHeader>
    <IonContent class="p-4 space-y-6">
      <CategoryList
        :categories="categories"
        :selected="selected"
        @select="handleSelect"
      />
      <ItemGrid :items="items" @add="handleAdd" />
    </IonContent>
    <CartDrawer :open="cartOpen" @close="cartOpen = false" />
  </IonPage>
</template>
