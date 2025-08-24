import { render, fireEvent } from '@testing-library/vue'
import { flushPromises } from '@vue/test-utils'
import ManualSyncView from '../views/ManualSyncView.vue'
import { vi } from 'vitest'

const syncItems = vi.fn()
const syncCustomers = vi.fn()
const syncSettings = vi.fn()
const syncOrders = vi.fn()

vi.mock('../store/mainStore', () => ({
  useMainStore: () => ({ syncItems, syncCustomers, syncSettings, syncOrders })
}))

vi.mock('../lib/errorHandler', () => ({ handleError: vi.fn() }))

import { handleError } from '../lib/errorHandler'

const stubs = {
  IonPage: { name: 'IonPage', template: '<div><slot/></div>' },
  IonContent: { name: 'IonContent', template: '<div><slot/></div>' },
  IonButton: { name: 'IonButton', template: '<button @click="$emit(\'click\')"><slot/></button>' },
  IonSpinner: { name: 'IonSpinner', template: '<span></span>' },
}

describe('ManualSyncView', () => {
  beforeEach(() => {
    syncItems.mockReset()
    syncCustomers.mockReset()
    syncSettings.mockReset()
    syncOrders.mockReset()
    handleError.mockReset()
  })

  it('invokes store methods on button click', async () => {
    const { getByText } = render(ManualSyncView, { global: { stubs } })
    await fireEvent.click(getByText('Sync Items'))
    expect(syncItems).toHaveBeenCalled()
    await fireEvent.click(getByText('Sync Customers'))
    expect(syncCustomers).toHaveBeenCalled()
    await fireEvent.click(getByText('Sync Settings'))
    expect(syncSettings).toHaveBeenCalled()
    await fireEvent.click(getByText('Sync Orders'))
    expect(syncOrders).toHaveBeenCalled()
  })

  it('handles errors for each action', async () => {
    syncItems.mockRejectedValueOnce(new Error('fail'))
    syncCustomers.mockRejectedValueOnce(new Error('fail'))
    syncSettings.mockRejectedValueOnce(new Error('fail'))
    syncOrders.mockRejectedValueOnce(new Error('fail'))
    const { getByText } = render(ManualSyncView, { global: { stubs } })
    await fireEvent.click(getByText('Sync Items'))
    await fireEvent.click(getByText('Sync Customers'))
    await fireEvent.click(getByText('Sync Settings'))
    await fireEvent.click(getByText('Sync Orders'))
    await flushPromises()
    expect(handleError).toHaveBeenCalledTimes(4)
  })
})

