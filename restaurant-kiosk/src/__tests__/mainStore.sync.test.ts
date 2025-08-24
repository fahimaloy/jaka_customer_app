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

import http from '../lib/http'
import * as db from '../lib/db'
import { useMainStore } from '../store/mainStore'

const mockedHttp = http as unknown as { get: ReturnType<typeof vi.fn> }
const mockedDb = db as unknown as Record<string, ReturnType<typeof vi.fn>>

describe('mainStore sync pagination', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockedDb.getUnsyncedOrders.mockResolvedValue([])
  })

  it('syncItems loops through paginated results', async () => {
    mockedHttp.get
      .mockResolvedValueOnce({ data: { items: [{ id: '1' }], next: 't2' } })
      .mockResolvedValueOnce({ data: { items: [{ id: '2' }], next: null } })
    const store = useMainStore()
    store.baseURL = 'http://base'
    store.token = 'tok'
    await store.syncItems()
    expect(mockedHttp.get).toHaveBeenNthCalledWith(
      1,
      'http://base/items',
      expect.any(Object)
    )
    expect(mockedHttp.get).toHaveBeenNthCalledWith(
      2,
      'http://base/items?page_token=t2',
      expect.any(Object)
    )
    expect(store.items).toEqual([{ id: '1' }, { id: '2' }])
    expect(mockedDb.bulkInsertItems).toHaveBeenCalledWith([
      { id: '1' },
      { id: '2' },
    ])
  })

  it('syncCustomers loops through paginated results', async () => {
    mockedHttp.get
      .mockResolvedValueOnce({ data: { customers: [{ id: '1' }], next: 'n2' } })
      .mockResolvedValueOnce({ data: { customers: [{ id: '2' }], next: null } })
    const store = useMainStore()
    store.baseURL = 'http://base'
    store.token = 'tok'
    await store.syncCustomers()
    expect(mockedHttp.get).toHaveBeenNthCalledWith(
      1,
      'http://base/customers',
      expect.any(Object)
    )
    expect(mockedHttp.get).toHaveBeenNthCalledWith(
      2,
      'http://base/customers?page_token=n2',
      expect.any(Object)
    )
    expect(store.customers).toEqual([{ id: '1' }, { id: '2' }])
    expect(mockedDb.bulkInsertCustomers).toHaveBeenCalledWith([
      { id: '1' },
      { id: '2' },
    ])
  })
})
