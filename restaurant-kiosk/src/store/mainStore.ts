import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import {
  bulkInsertItems,
  bulkInsertCustomers,
  createOrder,
  getCustomersList,
  getItemsList,
  type Item,
  type Customer,
  type OrderItem,
  type Order,
} from '../lib/db'
import { getBaseURL } from '../lib/api'

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

    async function login(email: string, password: string) {
      const url = await getBaseURL({ email, password })
      const { data } = await axios.post(`${url}/store-login`, {
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
      try {
        const { data } = await axios.get(`${baseURL.value}/items`, {
          headers: { Authorization: `Bearer ${token.value}` },
        })
        const fetched: Item[] = data?.items || data || []
        items.value = fetched
        await bulkInsertItems(fetched)
      } catch {
        items.value = await getItemsList()
      }
    }

    async function syncCustomers() {
      if (!baseURL.value || !token.value) return
      try {
        const { data } = await axios.get(`${baseURL.value}/customers`, {
          headers: { Authorization: `Bearer ${token.value}` },
        })
        const fetched: Customer[] = data?.customers || data || []
        customers.value = fetched
        await bulkInsertCustomers(fetched)
      } catch {
        customers.value = await getCustomersList()
      }
    }

    function addToCart(item: Item) {
      const existing = cart.value.find((c) => c.item.id === item.id)
      if (existing) {
        existing.quantity += 1
      } else {
        cart.value.push({ item, quantity: 1 })
      }
    }

    function removeFromCart(itemId: string) {
      const idx = cart.value.findIndex((c) => c.item.id === itemId)
      if (idx !== -1) {
        cart.value.splice(idx, 1)
      }
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
      try {
        if (baseURL.value && token.value) {
          await axios.post(`${baseURL.value}/orders`, order, {
            headers: { Authorization: `Bearer ${token.value}` },
          })
        }
      } finally {
        await createOrder(order)
        clearCart()
      }
    }

    function clearCart() {
      cart.value = []
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
      addToCart,
      removeFromCart,
      placeOrder,
      clearCart,
    }
  },
  { persist: true }
)

