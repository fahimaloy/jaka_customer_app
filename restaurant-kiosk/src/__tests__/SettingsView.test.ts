import { render, fireEvent } from '@testing-library/vue'
import SettingsView from '../views/SettingsView.vue'
import { vi } from 'vitest'

const factoryReset = vi.fn()

vi.mock('../store/mainStore', () => ({
  useMainStore: () => ({ factoryReset }),
}))

const push = vi.fn()

const stubs = {
  IonPage: { name: 'IonPage', template: '<div><slot/></div>' },
  IonContent: { name: 'IonContent', template: '<div><slot/></div>' },
  IonInput: {
    name: 'IonInput',
    props: ['modelValue', 'type', 'label', 'labelPlacement'],
    emits: ['update:modelValue'],
    template:
      '<input :type="type" :value="modelValue" :placeholder="label" @input="$emit(\'update:modelValue\', $event.target.value)" />',
  },
  IonButton: {
    name: 'IonButton',
    template: '<button @click="$emit(\'click\')"><slot/></button>',
  },
}

describe('SettingsView', () => {
  beforeEach(() => {
    factoryReset.mockReset()
    push.mockReset()
    localStorage.clear()
  })

  it('incorrect password does nothing', async () => {
    const { getByPlaceholderText, getByText } = render(SettingsView, {
      global: { stubs },
    })
    await fireEvent.update(getByPlaceholderText('Password'), 'wrong')
    await fireEvent.click(getByText('Factory Reset'))
    expect(factoryReset).not.toHaveBeenCalled()
  })

  it('correct password clears storage and navigates to login', async () => {
    factoryReset.mockImplementation(() => {
      localStorage.clear()
      push('/login')
    })
    localStorage.setItem('foo', 'bar')
    const { getByPlaceholderText, getByText } = render(SettingsView, {
      global: { stubs },
    })
    await fireEvent.update(getByPlaceholderText('Password'), 'jakatest')
    await fireEvent.click(getByText('Factory Reset'))
    expect(factoryReset).toHaveBeenCalled()
    expect(localStorage.getItem('foo')).toBeNull()
    expect(push).toHaveBeenCalledWith('/login')
  })
})

