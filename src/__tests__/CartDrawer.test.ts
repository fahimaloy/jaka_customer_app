import { render, fireEvent } from '@testing-library/vue'
import CartDrawer from '../components/CartDrawer.vue'
import { vi } from 'vitest'

const updateItemQuantity = vi.fn()
const clearCart = vi.fn()
const cart = [{ item: { id: '1', name: 'Burger', price: 5 }, quantity: 1 }]

vi.mock('../store/mainStore', () => ({
  useMainStore: () => ({ cart, updateItemQuantity, clearCart }),
}))

const stubs = {
  IonButton: { name: 'IonButton', template: '<button @click="$emit(\'click\')"><slot/></button>' },
}

describe('CartDrawer', () => {
  it('renders cart items and updates quantity', async () => {
    const { getByText } = render(CartDrawer, {
      props: { open: true },
      global: { stubs },
    })
    getByText('Burger')
    await fireEvent.click(getByText('+'))
    expect(updateItemQuantity).toHaveBeenCalledWith('1', 2)
  })
})
