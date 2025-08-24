<script setup lang="ts">
import { ref } from 'vue'
import { IonPage, IonContent, IonInput, IonButton } from '@ionic/vue'
import { useRouter } from 'vue-router'
import { useMainStore } from '../store/mainStore'

const email = ref('')
const password = ref('')
const store = useMainStore()
const router = useRouter()

async function onLogin() {
  try {
    await store.login(email.value, password.value)
    await store.syncItems()
    await store.syncCustomers()
    router.push('/home')
  } catch (err) {
    console.error(err)
  }
}
</script>

<template>
  <IonPage>
    <IonContent class="ion-padding">
      <form @submit.prevent="onLogin" class="flex flex-col gap-4">
        <IonInput
          v-model="email"
          type="email"
          label="Email"
          label-placement="floating"
          required
        />
        <IonInput
          v-model="password"
          type="password"
          label="Password"
          label-placement="floating"
          required
        />
        <IonButton type="submit" expand="block">Login</IonButton>
      </form>
    </IonContent>
  </IonPage>
</template>

<style scoped>
form {
  max-width: 400px;
  margin: 0 auto;
}
</style>

