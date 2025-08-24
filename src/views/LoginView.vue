<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  IonPage,
  IonContent,
  IonInput,
  IonButton,
  IonLoading
} from '@ionic/vue'
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
    router.push('/sync')
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
    <IonContent class="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-500 to-yellow-400">
      <div
        v-motion="{ initial: { opacity: 0, y: 20 }, enter: { opacity: 1, y: 0 } }"
        class="w-full max-w-sm p-8 bg-white rounded-3xl shadow-2xl space-y-8"
      >
        <div class="text-center space-y-4">
          <img
            src="/logo-placeholder.svg"
            alt="App logo"
            class="w-24 h-24 mx-auto animate-bounce"
          />
          <h1 class="text-3xl font-bold">Welcome</h1>
        </div>
        <form @submit.prevent="onLogin" class="flex flex-col gap-6">
          <div>
            <IonInput
              v-model="email"
              type="email"
              label="Email"
              label-placement="floating"
              required
              class="text-lg"
            />
            <p v-if="errors.email" class="text-red-600 text-sm mt-1">{{ errors.email }}</p>
          </div>
          <div>
            <IonInput
              v-model="password"
              type="password"
              label="Password"
              label-placement="floating"
              required
              class="text-lg"
            />
            <p v-if="errors.password" class="text-red-600 text-sm mt-1">{{ errors.password }}</p>
          </div>
          <IonButton
            type="submit"
            expand="block"
            class="py-4 text-lg mt-4"
            :disabled="loading"
          >
            Login
          </IonButton>
        </form>
      </div>
      <IonLoading :is-open="loading" message="Signing in..." />
    </IonContent>
  </IonPage>
</template>
