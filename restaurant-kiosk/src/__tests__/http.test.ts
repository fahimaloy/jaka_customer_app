import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('../lib/db', () => ({}))

import { useMainStore } from '../store/mainStore'
import { unauthorizedInterceptor, modalController } from '../lib/http'

const mockedModal = {
  present: vi.fn(),
  onWillDismiss: vi.fn().mockResolvedValue({}),
}

describe('http interceptor', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.spyOn(modalController, 'create').mockResolvedValue(mockedModal as any)
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: 'http://localhost/' },
    })
  })

  it('resets store and redirects on 401', async () => {
    const store = useMainStore()
    store.token = 't'
    await unauthorizedInterceptor({ response: { status: 401 } }).catch(() => {})
    expect(store.token).toBeNull()
    expect(window.location.href).toBe('/login')
  })
})

