<script setup lang="ts">
import { ref } from 'vue'
import { IonPage, IonContent, IonButton, IonSpinner } from '@ionic/vue'
import { useMainStore } from '../store/mainStore'
import { handleError } from '../lib/errorHandler'

const store = useMainStore()

const syncing = ref({
  items: false,
  customers: false,
  settings: false,
  orders: false,
})

async function run(key: 'items' | 'customers' | 'settings' | 'orders') {
  syncing.value[key] = true
  const map = {
    items: store.syncItems,
    customers: store.syncCustomers,
    settings: store.syncSettings,
    orders: store.syncOrders,
  }
  try {
    await map[key]()
  } catch (err) {
    handleError(err)
  } finally {
    syncing.value[key] = false
  }
}
</script>

<template>
  <IonPage>
    <IonContent class="ion-padding flex flex-col gap-4">
      <IonButton @click="run('items')" :disabled="syncing.items">
        Sync Items
        <IonSpinner v-if="syncing.items" slot="end" />
      </IonButton>
      <IonButton @click="run('customers')" :disabled="syncing.customers">
        Sync Customers
        <IonSpinner v-if="syncing.customers" slot="end" />
      </IonButton>
      <IonButton @click="run('settings')" :disabled="syncing.settings">
        Sync Settings
        <IonSpinner v-if="syncing.settings" slot="end" />
      </IonButton>
      <IonButton @click="run('orders')" :disabled="syncing.orders">
        Sync Orders
        <IonSpinner v-if="syncing.orders" slot="end" />
      </IonButton>
    </IonContent>
  </IonPage>
</template>

