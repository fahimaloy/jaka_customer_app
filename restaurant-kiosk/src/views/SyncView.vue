<script setup lang="ts">
import { onMounted } from 'vue'
import { IonPage, IonContent } from '@ionic/vue'
import { useRouter } from 'vue-router'
import { useMainStore } from '../store/mainStore'
import { handleError } from '../lib/errorHandler'

const router = useRouter()
const store = useMainStore()

onMounted(async () => {
  const syncTasks = [store.syncItems, store.syncCustomers, store.syncSettings].filter(Boolean)
  for (const task of syncTasks) {
    try {
      await task()
    } catch (err) {
      handleError(err)
    }
  }
  router.push('/home')
})
</script>

<template>
  <IonPage>
    <IonContent class="ion-padding">
      <p>Syncing...</p>
    </IonContent>
  </IonPage>
</template>
