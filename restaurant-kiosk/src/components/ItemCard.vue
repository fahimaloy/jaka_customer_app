<script setup lang="ts">
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonImg, IonButton } from '@ionic/vue'
import { computed, defineProps, defineEmits } from 'vue'
import type { Item } from '../lib/db'

type ItemWithImage = Item & { image_link?: string }

const props = defineProps<{ item: ItemWithImage }>()
const emit = defineEmits<{ (e: 'add', item: ItemWithImage): void }>()

const imageSrc = computed(
  () => props.item.image_link || 'https://placehold.co/128x128?text=No+Image'
)
function add() {
  emit('add', props.item)
}
</script>

<template>
  <IonCard
    v-motion="{
      initial: { opacity: 0, y: 10 },
      enter: { opacity: 1, y: 0 }
    }"
    class="h-full flex flex-col gap-2"
  >
    <IonImg :src="imageSrc" class="object-cover h-32 w-full" />
    <IonCardHeader>
      <IonCardTitle class="text-base">{{ props.item.name }}</IonCardTitle>
    </IonCardHeader>
    <IonCardContent class="mt-auto">
      <IonButton
        expand="block"
        @click="add"
        class="py-3 text-base"
      >
        Add to cart
      </IonButton>
    </IonCardContent>
  </IonCard>
</template>

