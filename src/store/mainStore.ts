import { defineStore } from 'pinia'
import { ref } from 'vue'
import http from '../lib/http'
import {
  bulkInsertItems,
  bulkInsertCustomers,
  createOrder,
  getUnsyncedOrders,
  markOrderSynced,
  getCustomersList,
  getItemsList,
  type Item,
  type Customer,
  type OrderItem,
  type Order,
} from '../lib/db'
import { getBaseURL } from '../lib/api'
import { handleError } from '../lib/errorHandler'
import { toastController, loadingController } from '@ionic/vue'
import { CapacitorSQLite } from '@capacitor-community/sqlite'
import router from '../router'

interface CartItem {
  item: Item
  quantity: number
}

export const useMainStore = defineStore(
  'main',
  () => {
    const token = ref<string | null>(null)
    const baseURL = ref('')
    const locations = ref<unknown[]>([])
    const settings = ref<unknown>(null)
    const categories = ref<unknown[]>([])
    const items = ref<Item[]>([])
    const customers = ref<Customer[]>([])
    const cart = ref<CartItem[]>([])
    const phone = ref('')
    const isOnline = ref(window.navigator.onLine)

    async function showToast(message: string, color: 'success' | 'danger' = 'success') {
      const toast = await toastController.create({ message, duration: 2000, color })
      await toast.present()
    }

    async function syncOrders() {
      if (!isOnline.value || !baseURL.value || !token.value) return
      const unsynced = await getUnsyncedOrders()
      for (const o of unsynced) {
        try {
          await http.post(`${baseURL.value}/place-order`, o, {
            headers: { Authorization: `Bearer ${token.value}` },
          })
          await markOrderSynced(o.id)
        } catch (err) {
          handleError(err)
        }
      }
      if (unsynced.length) {
        await showToast('Orders synced')
      }
    }

    window.addEventListener('online', () => {
      isOnline.value = true
      syncOrders()
    })
    window.addEventListener('offline', () => {
      isOnline.value = false
    })

    if (isOnline.value) {
      syncOrders()
    }

    async function login(email: string, password: string) {
      const url = await getBaseURL({ email, password })
      const { data } = await http.post(`${url}/store-login`, {
        email,
        password,
      })
      token.value = data.token
      locations.value = data.locations
      settings.value = data.settings
      baseURL.value = url
    }

    async function syncItems() {
      if (!baseURL.value || !token.value) return
      const loading = await loadingController.create({ message: 'Syncing items...' })
      await loading.present()
      try {
        const fetched: Item[] = []
        let next: string | null = null
        do {
          const url = new URL(`${baseURL.value}/items`)
          if (next) url.searchParams.set('page_token', next)
          const { data } = await http.get(url.toString(), {
            headers: { Authorization: `Bearer ${token.value}` },
          })
          fetched.push(...(data?.items || data || []))
          next = data?.next ?? null
        } while (next)
        items.value = fetched
        await bulkInsertItems(fetched)
        await showToast('Items synced')
      } catch (err) {
        handleError(err)
        items.value = await getItemsList()
      } finally {
        await loading.dismiss()
      }
    }

    async function syncCustomers() {
      if (!baseURL.value || !token.value) return
      const loading = await loadingController.create({ message: 'Syncing customers...' })
      await loading.present()
      try {
        const fetched: Customer[] = []
        let next: string | null = null
        do {
          const url = new URL(`${baseURL.value}/customers`)
          if (next) url.searchParams.set('page_token', next)
          const { data } = await http.get(url.toString(), {
            headers: { Authorization: `Bearer ${token.value}` },
          })
          fetched.push(...(data?.customers || data || []))
          next = data?.next ?? null
        } while (next)
        customers.value = fetched
        await bulkInsertCustomers(fetched)
        await showToast('Customers synced')
      } catch (err) {
        handleError(err)
        customers.value = await getCustomersList()
      } finally {
        await loading.dismiss()
      }
    }

    async function syncSettings() {
      if (!baseURL.value || !token.value) return
      const loading = await loadingController.create({ message: 'Syncing settings...' })
      await loading.present()
      try {
        const { data } = await http.get(`${baseURL.value}/settings`, {
          headers: { Authorization: `Bearer ${token.value}` },
        })
        settings.value = data
        await showToast('Settings synced')
      } catch (err) {
        handleError(err)
      } finally {
        await loading.dismiss()
      }
    }

    function addToCart(item: Item) {
      const existing = cart.value.find((c) => c.item.id === item.id)
      if (existing) {
        existing.quantity += 1
      } else {
        cart.value.push({ item, quantity: 1 })
      }
      void showToast('Item added to cart')
    }

    function updateItemQuantity(itemId: string, quantity: number) {
      const existing = cart.value.find((c) => c.item.id === itemId)
      if (!existing) return
      existing.quantity = quantity
      if (existing.quantity <= 0) {
        removeItem(itemId)
      }
    }

    function editItem(itemId: string, updated: Item) {
      const existing = cart.value.find((c) => c.item.id === itemId)
      if (existing) {
        existing.item = updated
      }
    }

    function removeItem(itemId: string) {
      const idx = cart.value.findIndex((c) => c.item.id === itemId)
      if (idx !== -1) {
        cart.value.splice(idx, 1)
      }
    }

    // Backwards compatibility
    function removeFromCart(itemId: string) {
      removeItem(itemId)
    }

    function filterItems(category: string | null) {
      if (!category) return items.value
      return items.value.filter(
        (i: any) => i.category_id === category || i.category === category
      )
    }

    function searchItems(query: string) {
      const q = query.trim().toLowerCase()
      if (!q) return items.value
      return items.value.filter((i) => i.name.toLowerCase().includes(q))
    }

    async function placeOrder(customerId: string) {
      const orderItems: OrderItem[] = cart.value.map((c) => ({
        itemId: c.item.id,
        quantity: c.quantity,
      }))
      const order: Order = {
        id: Date.now().toString(),
        customerId,
        items: orderItems,
      }
      if (isOnline.value && baseURL.value && token.value) {
        try {
          await http.post(`${baseURL.value}/place-order`, order, {
            headers: { Authorization: `Bearer ${token.value}` },
          })
          await createOrder(order, 1)
        } catch (err) {
          handleError(err)
          await createOrder(order, 0)
        }
      } else {
        await createOrder(order, 0)
      }
      clearCart()
    }

    function clearCart() {
      cart.value = []
    }

    async function factoryReset() {
      try {
        await CapacitorSQLite.deleteDatabase({ database: 'app_db' })
      } catch {}

      try {
        localStorage.clear()
      } catch {}

      try {
        // indexedDB.databases is not available in all browsers
        const anyIndexed = indexedDB as any
        if (anyIndexed && typeof anyIndexed.databases === 'function') {
          const dbs = await anyIndexed.databases()
          for (const db of dbs) {
            await new Promise<void>((resolve) => {
              const req = indexedDB.deleteDatabase(db.name)
              req.onsuccess = () => resolve()
              req.onerror = () => resolve()
              req.onblocked = () => resolve()
            })
          }
        }
      } catch {}

      token.value = null
      baseURL.value = ''
      locations.value = []
      settings.value = null
      categories.value = []
      items.value = []
      customers.value = []
      cart.value = []
      phone.value = ''
      isOnline.value = window.navigator.onLine

      await router.push('/login')
    }

    return {
      token,
      baseURL,
      locations,
      settings,
      categories,
      items,
      customers,
      cart,
      phone,
      login,
      syncItems,
      syncCustomers,
      syncSettings,
      addToCart,
      updateItemQuantity,
      editItem,
      removeItem,
      removeFromCart,
      filterItems,
      searchItems,
      placeOrder,
      clearCart,
      isOnline,
      syncOrders,
      factoryReset,
    }
  },
  { persist: true }
)

