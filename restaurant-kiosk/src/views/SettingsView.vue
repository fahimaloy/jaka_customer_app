<script setup lang="ts">
import { ref } from 'vue'
import { IonPage, IonContent, IonInput, IonButton } from '@ionic/vue'
import { useMainStore } from '../store/mainStore'

const password = ref('')
const store = useMainStore()

async function onFactoryReset() {
  if (password.value === 'jakatest') {
    await store.factoryReset()
  }
}
</script>

<template>
  <IonPage>
    <IonContent class="ion-padding">
      <div class="flex flex-col gap-4 max-w-md mx-auto">
        <IonInput
          v-model="password"
          type="password"
          label="Password"
          label-placement="floating"
        />
        <IonButton expand="block" class="py-4" @click="onFactoryReset">
          Factory Reset
        </IonButton>
      </div>
    </IonContent>
  </IonPage>
</template>

