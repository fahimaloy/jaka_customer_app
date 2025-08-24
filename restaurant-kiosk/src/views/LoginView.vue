<script setup lang="ts">
import { ref, watch } from 'vue'
import { IonPage, IonContent, IonInput, IonButton, IonLoading } from '@ionic/vue'
import { useRouter } from 'vue-router'
import { useMainStore } from '../store/mainStore'
import { handleError } from '../lib/errorHandler'

const email = ref('')
const password = ref('')
const loading = ref(false)
const errors = ref<{ email?: string; password?: string }>({})
const store = useMainStore()
const router = useRouter()

async function onLogin() {
  errors.value = {}
  if (!email.value || !/^\S+@\S+\.\S+$/.test(email.value)) {
    errors.value.email = 'Valid email required'
  }
  if (!password.value) {
    errors.value.password = 'Password is required'
  }
  if (errors.value.email || errors.value.password) return
  loading.value = true
  try {
    await store.login(email.value, password.value)
    await store.syncItems()
    await store.syncCustomers()
    router.push('/home')
  } catch (err) {
    handleError(err)
  } finally {
    loading.value = false
  }
}

watch(email, () => (errors.value.email = ''))
watch(password, () => (errors.value.password = ''))
</script>

<template>
  <IonPage>
    <IonContent class="ion-padding">
      <form
        @submit.prevent="onLogin"
        class="flex flex-col gap-4 max-w-md mx-auto"
      >
        <IonInput
          v-model="email"
          type="email"
          label="Email"
          label-placement="floating"
          required
          class="text-lg"
        />
        <p v-if="errors.email" class="text-red-500 text-sm">{{ errors.email }}</p>
        <IonInput
          v-model="password"
          type="password"
          label="Password"
          label-placement="floating"
          required
          class="text-lg"
        />
        <p v-if="errors.password" class="text-red-500 text-sm">{{ errors.password }}</p>
        <IonButton
          type="submit"
          expand="block"
          class="py-4 text-lg"
          :disabled="loading"
        >
          Login
        </IonButton>
      </form>
      <IonLoading :is-open="loading" message="Signing in..." />
    </IonContent>
  </IonPage>
</template>

