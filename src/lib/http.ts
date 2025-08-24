import axios from 'axios'
import { modalController } from '@ionic/vue'
import { useMainStore } from '../store/mainStore'
import { defineComponent } from 'vue'

const SessionExpired = defineComponent({
  template: `
    <div class="ion-padding">
      <p>Session expired. Please log in again.</p>
      <button id="session-expired-ok" @click="dismiss">OK</button>
    </div>
  `,
  setup() {
    const dismiss = () => {
      void modalController.dismiss()
    }
    return { dismiss }
  },
})

const http = axios.create()

export async function unauthorizedInterceptor(error: any) {
  const store = useMainStore()
  store.token = null
  store.baseURL = ''
  store.locations = []
  store.settings = null
  localStorage.clear()
  const modal = await modalController.create({
    component: SessionExpired,
    backdropDismiss: false,
  })
  await modal.present()
  await modal.onWillDismiss()
  window.location.href = '/login'
  return Promise.reject(error)
}

http.interceptors.response.use((res) => res, unauthorizedInterceptor)

export default http
export { modalController }

