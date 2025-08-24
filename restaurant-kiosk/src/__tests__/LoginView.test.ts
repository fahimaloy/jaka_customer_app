import { render, fireEvent } from '@testing-library/vue'
import { flushPromises } from '@vue/test-utils'
import LoginView from '../views/LoginView.vue'
import { vi } from 'vitest'

const login = vi.fn()
const push = vi.fn()

vi.mock('../store/mainStore', () => ({
  useMainStore: () => ({ login }),
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
      props: ['type', 'disabled'],
      template: '<button :type="type" :disabled="disabled"><slot/></button>',
    },
    IonLoading: {
      name: 'IonLoading',
      props: ['isOpen', 'message'],
      template: '<div v-if="isOpen" data-testid="loading">{{ message }}</div>',
    },
  }

    beforeEach(() => {
      login.mockReset()
      push.mockReset()
      handleError.mockReset()
    })

  it('logs in and navigates on success', async () => {
      login.mockResolvedValue(undefined)
      const { getByPlaceholderText, container } = render(LoginView, {
        global: { stubs },
      })
      await fireEvent.update(getByPlaceholderText('Email'), 'e@test.com')
      await fireEvent.update(getByPlaceholderText('Password'), 'pw')
      const form = container.querySelector('form') as HTMLFormElement
      await fireEvent.submit(form)
      await flushPromises()
      expect(login).toHaveBeenCalledWith('e@test.com', 'pw')
      expect(push).toHaveBeenCalledWith('/sync')
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
      expect(push).not.toHaveBeenCalled()
      expect(handleError).toHaveBeenCalled()
    })

  it('shows validation errors', async () => {
    const { container, getByText } = render(LoginView, { global: { stubs } })
    const form = container.querySelector('form') as HTMLFormElement
    await fireEvent.submit(form)
    getByText('Valid email required')
    getByText('Password is required')
  })

  it('disables button and shows loading during login', async () => {
      let resolveLogin: () => void = () => {}
      login.mockImplementation(
        () =>
          new Promise((res) => {
            resolveLogin = () => res(undefined)
          })
      )
      const { getByPlaceholderText, getByText, queryByTestId } = render(LoginView, {
        global: { stubs },
      })
      await fireEvent.update(getByPlaceholderText('Email'), 'e@test.com')
      await fireEvent.update(getByPlaceholderText('Password'), 'pw')
      const button = getByText('Login') as HTMLButtonElement
      await fireEvent.click(button)
      expect(button.disabled).toBe(true)
      expect(queryByTestId('loading')).toBeTruthy()
      resolveLogin()
      await flushPromises()
      expect(button.disabled).toBe(false)
    })
})
