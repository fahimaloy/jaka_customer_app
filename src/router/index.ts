import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import SyncView from '../views/SyncView.vue'
import HomeView from '../views/HomeView.vue'
import ManualSyncView from '../views/ManualSyncView.vue'
import SettingsView from '../views/SettingsView.vue'

const routes: RouteRecordRaw[] = [
  { path: '/login', component: LoginView },
  { path: '/sync', component: SyncView },
  { path: '/manual-sync', component: ManualSyncView },
  { path: '/home', component: HomeView },
  { path: '/settings', component: SettingsView },
  { path: '/', redirect: '/login' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
