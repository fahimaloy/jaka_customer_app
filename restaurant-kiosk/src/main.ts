import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { IonicVue } from '@ionic/vue'
import persisted from 'pinia-plugin-persistedstate'
import './main.css'
import '@ionic/vue/css/core.css'
import App from './App.vue'
import { dbReady } from './lib/db'

const app = createApp(App)
const pinia = createPinia()
pinia.use(persisted)
app.use(IonicVue)
app.use(pinia)

dbReady
  .then(() => app.mount('#app'))
  .catch((err) => console.error('Database initialization failed', err))
