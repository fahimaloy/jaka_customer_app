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
  getUnsyncedOrders: vi.fn(),
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

import http from '../lib/http'
import * as api from '../lib/api'
import * as db from '../lib/db'
import { handleError } from '../lib/errorHandler'
import { useMainStore } from '../store/mainStore'

const mockedHttp = http as unknown as {
  post: ReturnType<typeof vi.fn>
  get: ReturnType<typeof vi.fn>
}
const mockedApi = api as unknown as { getBaseURL: ReturnType<typeof vi.fn> }
const mockedDb = db as unknown as Record<string, ReturnType<typeof vi.fn>>
const mockedHandleError = handleError as unknown as ReturnType<typeof vi.fn>

describe('mainStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('login sets auth data', async () => {
    mockedApi.getBaseURL.mockResolvedValue('http://base')
    mockedHttp.post.mockResolvedValue({
      data: { token: 't', locations: [1], settings: { s: true } },
    })
    const store = useMainStore()
    await store.login('e', 'p')
    expect(store.token).toBe('t')
    expect(store.locations).toEqual([1])
    expect(store.settings).toEqual({ s: true })
    expect(store.baseURL).toBe('http://base')
  })

  it('login propagates errors', async () => {
    mockedApi.getBaseURL.mockResolvedValue('http://base')
    mockedHttp.post.mockRejectedValue(new Error('fail'))
    const store = useMainStore()
    await expect(store.login('e', 'p')).rejects.toThrow('fail')
  })

  it('syncItems fetches and saves items', async () => {
    mockedHttp.get.mockResolvedValue({
      data: { items: [{ id: '1', name: 'i', price: 1 }] },
    })
    const store = useMainStore()
    store.baseURL = 'http://base'
    store.token = 't'
    await store.syncItems()
    expect(store.items).toEqual([{ id: '1', name: 'i', price: 1 }])
    expect(mockedDb.bulkInsertItems).toHaveBeenCalledWith([
      { id: '1', name: 'i', price: 1 },
    ])
  })

  it('syncItems falls back to local cache on error', async () => {
    mockedHttp.get.mockRejectedValue(new Error('fail'))
    mockedDb.getItemsList.mockResolvedValue([
      { id: '2', name: 'cached', price: 2 },
    ])
    const store = useMainStore()
    store.baseURL = 'http://base'
    store.token = 't'
    await store.syncItems()
    expect(store.items).toEqual([{ id: '2', name: 'cached', price: 2 }])
  })

  it('syncCustomers fetches and saves customers', async () => {
    mockedHttp.get.mockResolvedValue({
      data: { customers: [{ id: '1', name: 'c' }] },
    })
    const store = useMainStore()
    store.baseURL = 'http://base'
    store.token = 't'
    await store.syncCustomers()
    expect(store.customers).toEqual([{ id: '1', name: 'c' }])
    expect(mockedDb.bulkInsertCustomers).toHaveBeenCalledWith([
      { id: '1', name: 'c' },
    ])
  })

  it('syncCustomers falls back to cache on error', async () => {
    mockedHttp.get.mockRejectedValue(new Error('fail'))
    mockedDb.getCustomersList.mockResolvedValue([
      { id: '2', name: 'cached' },
    ])
    const store = useMainStore()
    store.baseURL = 'http://base'
    store.token = 't'
    await store.syncCustomers()
    expect(store.customers).toEqual([{ id: '2', name: 'cached' }])
  })

  it('syncOrders reports errors via handleError', async () => {
    mockedDb.getUnsyncedOrders.mockResolvedValue([{ id: '1' }])
    mockedHttp.post.mockRejectedValue(new Error('fail'))
    const store = useMainStore()
    store.baseURL = 'http://base'
    store.token = 't'
    store.isOnline = true
    await store.syncOrders()
    expect(mockedHandleError).toHaveBeenCalled()
  })

  it('placeOrder sends order when online', async () => {
    mockedHttp.post.mockResolvedValue({})
    const store = useMainStore()
    store.baseURL = 'http://base'
    store.token = 't'
    store.isOnline = true
    const item = { id: '1', name: 'i', price: 1 }
    store.cart.push({ item, quantity: 2 })
    await store.placeOrder('cust')
    expect(mockedDb.createOrder).toHaveBeenCalledWith(
      expect.objectContaining({ customerId: 'cust' }),
      1,
    )
    expect(store.cart.length).toBe(0)
  })

  it('placeOrder queues order when offline or failed', async () => {
    mockedHttp.post.mockRejectedValue(new Error('fail'))
    const store = useMainStore()
    store.baseURL = 'http://base'
    store.token = 't'
    store.isOnline = true
    const item = { id: '1', name: 'i', price: 1 }
    store.cart.push({ item, quantity: 1 })
    await store.placeOrder('cust')
    expect(mockedDb.createOrder).toHaveBeenCalledWith(
      expect.objectContaining({ customerId: 'cust' }),
      0,
    )
    expect(store.cart.length).toBe(0)
    expect(mockedHandleError).toHaveBeenCalled()
  })

  it('addToCart and removeFromCart work', () => {
    const store = useMainStore()
    const item = { id: '1', name: 'i', price: 1 }
    store.addToCart(item)
    store.addToCart(item)
    expect(store.cart[0].quantity).toBe(2)
    store.removeFromCart('1')
    expect(store.cart.length).toBe(0)
  })

  it('removeFromCart ignores missing items', () => {
    const store = useMainStore()
    store.removeFromCart('nope')
    expect(store.cart.length).toBe(0)
  })
})
