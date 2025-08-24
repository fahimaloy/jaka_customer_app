import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('../lib/http', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

vi.mock('../lib/api', () => ({
  getBaseURL: vi.fn(),
}))

vi.mock('../lib/db', () => ({
  bulkInsertItems: vi.fn(),
  bulkInsertCustomers: vi.fn(),
  createOrder: vi.fn(),
  getUnsyncedOrders: vi.fn().mockResolvedValue([]),
  markOrderSynced: vi.fn(),
  getCustomersList: vi.fn(),
  getItemsList: vi.fn(),
}))

vi.mock('../lib/errorHandler', () => ({
  handleError: vi.fn(),
}))

vi.mock('@ionic/vue', () => ({
  toastController: { create: vi.fn().mockResolvedValue({ present: vi.fn() }) },
  loadingController: {
    create: vi.fn().mockResolvedValue({ present: vi.fn(), dismiss: vi.fn() }),
  },
}))

vi.mock('@capacitor-community/sqlite', () => ({
  CapacitorSQLite: { deleteDatabase: vi.fn() },
}))

import { useMainStore } from '../store/mainStore'

describe('mainStore cart operations', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('updateItemQuantity adjusts and removes when zero', () => {
    const store = useMainStore()
    const item = { id: '1', name: 'i', price: 1 }
    store.addToCart(item)
    store.updateItemQuantity('1', 5)
    expect(store.cart[0].quantity).toBe(5)
    store.updateItemQuantity('1', 0)
    expect(store.cart.length).toBe(0)
  })

  it('editItem updates item details', () => {
    const store = useMainStore()
    const item = { id: '1', name: 'i', price: 1 }
    store.addToCart(item)
    store.editItem('1', { id: '1', name: 'new', price: 2 })
    expect(store.cart[0].item).toEqual({ id: '1', name: 'new', price: 2 })
  })

  it('removeItem deletes item from cart', () => {
    const store = useMainStore()
    const item = { id: '1', name: 'i', price: 1 }
    store.addToCart(item)
    store.removeItem('1')
    expect(store.cart.length).toBe(0)
  })
})
