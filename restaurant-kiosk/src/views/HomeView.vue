<script setup lang="ts">
import { ref, computed } from 'vue'
import { IonPage, IonContent } from '@ionic/vue'
import CategoryList from '../components/CategoryList.vue'
import ItemGrid from '../components/ItemGrid.vue'
import { useMainStore } from '../store/mainStore'
import type { Item } from '../lib/db'

type ItemWithImage = Item & { image_link?: string; category_id?: string; category?: string }
interface Category { id: string; name: string }

const store = useMainStore()
const selected = ref<string | null>(null)

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
</script>

<template>
  <IonPage>
    <IonContent>
      <CategoryList
        :categories="categories"
        :selected="selected"
        @select="handleSelect"
      />
      <ItemGrid :items="items" @add="handleAdd" />
    </IonContent>
  </IonPage>
</template>
