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
  <IonSegment
    :value="props.selected || ''"
    @ionChange="onChange"
    scrollable
    class="px-2 py-4"
  >
    <IonSegmentButton value="" class="min-h-12">
      <IonLabel class="text-base">All</IonLabel>
    </IonSegmentButton>
    <IonSegmentButton
      v-for="cat in props.categories"
      :key="cat.id"
      :value="cat.id"
      class="min-h-12"
    >
      <IonLabel class="text-base">{{ cat.name }}</IonLabel>
    </IonSegmentButton>
  </IonSegment>
</template>
