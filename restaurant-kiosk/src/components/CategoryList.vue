<script setup lang="ts">
import { IonSegment, IonSegmentButton, IonLabel } from '@ionic/vue'
import { defineProps, defineEmits } from 'vue'

interface Category { id: string; name: string }

const props = defineProps<{ categories: Category[]; selected: string | null }>()
const emit = defineEmits<{ (e: 'select', id: string | null): void }>()

function onChange(ev: CustomEvent) {
  const value = (ev.detail as any).value || null
  emit('select', value)
}
</script>

<template>
  <IonSegment :value="props.selected || ''" @ionChange="onChange" scrollable>
    <IonSegmentButton value="">
      <IonLabel>All</IonLabel>
    </IonSegmentButton>
    <IonSegmentButton
      v-for="cat in props.categories"
      :key="cat.id"
      :value="cat.id"
    >
      <IonLabel>{{ cat.name }}</IonLabel>
    </IonSegmentButton>
  </IonSegment>
</template>
