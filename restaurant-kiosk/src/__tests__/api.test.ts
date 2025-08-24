import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useMainStore } from '../store/mainStore'

vi.mock('../lib/db', () => ({}))
vi.mock('../lib/http', () => ({
  default: {
    post: vi.fn(),
  },
}))

import { getBaseURL, login } from '../lib/api'

import http from '../lib/http'
const mockedHttp = http as unknown as { post: ReturnType<typeof vi.fn> }

describe('api helpers', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('getBaseURL returns domain', async () => {
    mockedHttp.post.mockResolvedValue({ data: { baseURL: 'http://base' } })
    const url = await getBaseURL({ email: 'e', password: 'p' })
    expect(url).toBe('http://base')
  })

  it('getBaseURL rejects on error', async () => {
    mockedHttp.post.mockRejectedValue(new Error('fail'))
    await expect(getBaseURL({ email: 'e', password: 'p' })).rejects.toThrow('fail')
  })

  it('login sets store data', async () => {
    mockedHttp.post
      .mockResolvedValueOnce({ data: { baseURL: 'http://base' } })
      .mockResolvedValueOnce({
        data: { token: 't', locations: [1], settings: { s: true } },
      })
    const result = await login({ email: 'e', password: 'p' })
    const store = useMainStore()
    expect(result.token).toBe('t')
    expect(store.token).toBe('t')
    expect(store.locations).toEqual([1])
    expect(store.settings).toEqual({ s: true })
  })

  it('login rejects on failure', async () => {
    mockedHttp.post
      .mockResolvedValueOnce({ data: { baseURL: 'http://base' } })
      .mockRejectedValueOnce(new Error('fail'))
    await expect(login({ email: 'e', password: 'p' })).rejects.toThrow('fail')
  })
})
