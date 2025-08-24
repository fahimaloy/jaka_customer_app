import { createApp } from 'vue'
import { createPinia } from 'pinia'
import persisted from 'pinia-plugin-persistedstate'
import './main.css'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()
pinia.use(persisted)
app.use(pinia)

app.mount('#app')
