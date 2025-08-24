<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import {
  IonPage,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonSpinner,
  IonIcon,
  IonProgressBar
} from '@ionic/vue'
import { useRouter } from 'vue-router'
import { useMainStore } from '../store/mainStore'
import { handleError } from '../lib/errorHandler'
import { checkmarkCircleOutline } from 'ionicons/icons'

const router = useRouter()
const store = useMainStore()

const tasks = [
  { key: 'syncItems', label: 'Items' },
  { key: 'syncCustomers', label: 'Customers' },
  { key: 'syncSettings', label: 'Settings' },
]
const status = ref<Record<string, 'pending' | 'loading' | 'done'>>({})
const current = ref(0)
const progress = computed(() => current.value / tasks.length)

onMounted(async () => {
  for (const [idx, t] of tasks.entries()) {
    status.value[t.key] = 'loading'
    try {
      await (store as any)[t.key]()
    } catch (err) {
      handleError(err)
    } finally {
      status.value[t.key] = 'done'
      current.value = idx + 1
    }
  }
  router.push('/home')
})
</script>

<template>
  <IonPage>
    <IonContent class="flex items-center justify-center min-h-screen bg-gray-50">
      <div
        v-motion="{ initial: { opacity: 0, y: 20 }, enter: { opacity: 1, y: 0 } }"
        class="w-full max-w-md bg-white rounded-lg shadow p-6 space-y-6"
      >
        <IonProgressBar :value="progress" class="h-2" />
        <IonList>
          <IonItem v-for="t in tasks" :key="t.key">
            <IonLabel>{{ t.label }}</IonLabel>
            <IonSpinner v-if="status[t.key] !== 'done'" slot="end" />
            <IonIcon
              v-else
              :icon="checkmarkCircleOutline"
              class="text-green-500 text-xl"
              slot="end"
            />
          </IonItem>
        </IonList>
      </div>
    </IonContent>
  </IonPage>
</template>
