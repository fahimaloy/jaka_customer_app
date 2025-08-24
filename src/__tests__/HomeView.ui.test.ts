import { render } from '@testing-library/vue'
import HomeView from '../views/HomeView.vue'
import { vi } from 'vitest'

vi.mock('../store/mainStore', () => ({
  useMainStore: () => ({
    categories: [{ id: '1', name: 'Cat' }],
    items: [{ id: '1', name: 'Item', price: 1, category_id: '1' }],
    cart: [],
    addToCart: vi.fn(),
  }),
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

const stubs = {
  IonPage: { name: 'IonPage', template: '<div v-bind="$attrs"><slot/></div>' },
  IonContent: { name: 'IonContent', template: '<div v-bind="$attrs"><slot/></div>' },
  IonHeader: { name: 'IonHeader', template: '<div v-bind="$attrs"><slot/></div>' },
  IonToolbar: { name: 'IonToolbar', template: '<div v-bind="$attrs"><slot/></div>' },
  IonTitle: { name: 'IonTitle', template: '<h1 v-bind="$attrs"><slot/></h1>' },
  IonSegment: { name: 'IonSegment', template: '<div v-bind="$attrs"><slot/></div>' },
  IonSegmentButton: {
    name: 'IonSegmentButton',
    props: ['value'],
    template: '<button v-bind="$attrs" :value="value"><slot/></button>',
  },
  IonLabel: { name: 'IonLabel', template: '<span v-bind="$attrs"><slot/></span>' },
  IonGrid: { name: 'IonGrid', template: '<div v-bind="$attrs"><slot/></div>' },
  IonRow: { name: 'IonRow', template: '<div v-bind="$attrs"><slot/></div>' },
  IonCol: { name: 'IonCol', template: '<div v-bind="$attrs"><slot/></div>' },
  IonButton: { name: 'IonButton', template: '<button v-bind="$attrs"><slot/></button>' },
  IonIcon: { name: 'IonIcon', props: ['icon'], template: '<i />' },
  ItemCard: { name: 'ItemCard', props: ['item'], template: '<div />' },
  CartDrawer: { name: 'CartDrawer', props: ['open'], template: '<div />' },
}

describe('HomeView kiosk UI', () => {
  it('applies kiosk-specific classes', () => {
    const { container } = render(HomeView, { global: { stubs } })
    expect(container.querySelector('.kiosk-theme')).toBeTruthy()
    expect(container.querySelector('.btn-lg')).toBeTruthy()
    expect(container.querySelector('.text-xl')).toBeTruthy()
  })
})
