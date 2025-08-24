<script setup lang="ts">
import { IonGrid, IonRow, IonCol } from '@ionic/vue'
import { defineProps, defineEmits } from 'vue'
import ItemCard from './ItemCard.vue'
import type { Item } from '../lib/db'

type ItemWithImage = Item & { image_link?: string }

const props = defineProps<{ items: ItemWithImage[] }>()
const emit = defineEmits<{ (e: 'add', item: ItemWithImage): void }>()

function handleAdd(item: ItemWithImage) {
  emit('add', item)
}
</script>

<template>
  <IonGrid>
    <IonRow>
      <IonCol
        v-for="item in props.items"
        :key="item.id"
        size="6"
        size-md="4"
        size-lg="3"
      >
        <ItemCard :item="item" @add="handleAdd" />
      </IonCol>
    </IonRow>
  </IonGrid>
</template>
