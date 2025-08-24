import { render } from '@testing-library/vue'
import { flushPromises } from '@vue/test-utils'
import SyncView from '../views/SyncView.vue'
import { vi } from 'vitest'

const syncItems = vi.fn()
const syncCustomers = vi.fn()
const syncSettings = vi.fn()
const push = vi.fn()

vi.mock('../store/mainStore', () => ({
  useMainStore: () => ({ syncItems, syncCustomers, syncSettings })
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push })
}))

vi.mock('../lib/errorHandler', () => ({ handleError: vi.fn() }))

import { handleError } from '../lib/errorHandler'

const stubs = {
  IonPage: { name: 'IonPage', template: '<div><slot/></div>' },
  IonContent: { name: 'IonContent', template: '<div><slot/></div>' }
}

describe('SyncView', () => {
  beforeEach(() => {
    syncItems.mockReset()
    syncCustomers.mockReset()
    syncSettings.mockReset()
    push.mockReset()
    handleError.mockReset()
  })

  it('continues syncing after failures', async () => {
    syncItems.mockRejectedValue(new Error('fail'))
    syncCustomers.mockResolvedValue(undefined)
    syncSettings.mockResolvedValue(undefined)
    render(SyncView, { global: { stubs } })
    await flushPromises()
    expect(syncItems).toHaveBeenCalled()
    expect(syncCustomers).toHaveBeenCalled()
    expect(syncSettings).toHaveBeenCalled()
    expect(handleError).toHaveBeenCalled()
    expect(push).toHaveBeenCalledWith('/home')
  })

  it('navigates home on success', async () => {
    syncItems.mockResolvedValue(undefined)
    syncCustomers.mockResolvedValue(undefined)
    syncSettings.mockResolvedValue(undefined)
    render(SyncView, { global: { stubs } })
    await flushPromises()
    expect(push).toHaveBeenCalledWith('/home')
    expect(handleError).not.toHaveBeenCalled()
  })
})
