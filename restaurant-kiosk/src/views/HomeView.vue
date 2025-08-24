<script setup lang="ts">
import { ref, computed } from 'vue'
import { IonPage, IonContent, IonButton } from '@ionic/vue'
import CategoryList from '../components/CategoryList.vue'
import ItemGrid from '../components/ItemGrid.vue'
import { useMainStore } from '../store/mainStore'
import type { Item } from '../lib/db'
import { useRouter } from 'vue-router'

type ItemWithImage = Item & { image_link?: string; category_id?: string; category?: string }
interface Category { id: string; name: string }

const store = useMainStore()
const selected = ref<string | null>(null)
const router = useRouter()

const categories = computed(() => (store.categories as Category[]) || [])
const items = computed<ItemWithImage[]>(() => {
  const list = store.items as ItemWithImage[]
  if (!selected.value) return list
  return list.filter(
    (i) => i.category_id === selected.value || i.category === selected.value
  )
})

function handleSelect(id: string | null) {
  selected.value = id
}
function handleAdd(item: ItemWithImage) {
  store.addToCart(item)
}

function goManualSync() {
  router.push('/manual-sync')
}
</script>

<template>
  <IonPage class="kiosk-theme">
    <IonContent class="p-4 space-y-6">
      <div class="flex justify-end">
        <IonButton
          class="btn-lg text-xl bg-blue-600 text-white"
          @click="goManualSync"
        >
          Manual Sync
        </IonButton>
      </div>
      <CategoryList
        :categories="categories"
        :selected="selected"
        @select="handleSelect"
      />
      <ItemGrid :items="items" @add="handleAdd" />
    </IonContent>
  </IonPage>
</template>
