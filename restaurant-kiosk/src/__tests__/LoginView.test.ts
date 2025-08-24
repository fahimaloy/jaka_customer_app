import { render, fireEvent } from '@testing-library/vue'
import { flushPromises } from '@vue/test-utils'
import LoginView from '../views/LoginView.vue'
import { vi } from 'vitest'

const login = vi.fn()
const syncItems = vi.fn()
const syncCustomers = vi.fn()
const push = vi.fn()

vi.mock('../store/mainStore', () => ({
  useMainStore: () => ({ login, syncItems, syncCustomers }),
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push }),
}))
vi.mock('../lib/errorHandler', () => ({ handleError: vi.fn() }))

import { handleError } from '../lib/errorHandler'

describe('LoginView', () => {
  const stubs = {
    IonPage: { name: 'IonPage', template: '<div><slot/></div>' },
    IonContent: { name: 'IonContent', template: '<div><slot/></div>' },
    IonInput: {
      name: 'IonInput',
      props: ['modelValue', 'type', 'label', 'labelPlacement', 'required'],
      emits: ['update:modelValue'],
      template:
        '<input :type="type" :value="modelValue" :placeholder="label" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    },
    IonButton: {
      name: 'IonButton',
      props: ['type'],
      template: '<button :type="type"><slot/></button>',
    },
  }

  beforeEach(() => {
    login.mockReset()
    syncItems.mockReset()
    syncCustomers.mockReset()
    push.mockReset()
    handleError.mockReset()
  })

  it('logs in and navigates on success', async () => {
    login.mockResolvedValue(undefined)
    syncItems.mockResolvedValue(undefined)
    syncCustomers.mockResolvedValue(undefined)
    const { getByPlaceholderText, container } = render(LoginView, {
      global: { stubs },
    })
    await fireEvent.update(getByPlaceholderText('Email'), 'e@test.com')
    await fireEvent.update(getByPlaceholderText('Password'), 'pw')
    const form = container.querySelector('form') as HTMLFormElement
    await fireEvent.submit(form)
    await flushPromises()
    expect(login).toHaveBeenCalledWith('e@test.com', 'pw')
    expect(syncItems).toHaveBeenCalled()
    expect(syncCustomers).toHaveBeenCalled()
    expect(push).toHaveBeenCalledWith('/home')
  })

  it('handles login errors', async () => {
    login.mockRejectedValue(new Error('fail'))
    const { getByPlaceholderText, container } = render(LoginView, {
      global: { stubs },
    })
    await fireEvent.update(getByPlaceholderText('Email'), 'e@test.com')
    await fireEvent.update(getByPlaceholderText('Password'), 'pw')
    const form = container.querySelector('form') as HTMLFormElement
    await fireEvent.submit(form)
    await flushPromises()
    expect(syncItems).not.toHaveBeenCalled()
    expect(push).not.toHaveBeenCalled()
    expect(handleError).toHaveBeenCalled()
  })
})
