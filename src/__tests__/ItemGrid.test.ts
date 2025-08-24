import { mount } from '@vue/test-utils'
import ItemGrid from '../components/ItemGrid.vue'

const stubs = {
  IonGrid: { name: 'IonGrid', template: '<div><slot/></div>' },
  IonRow: { name: 'IonRow', template: '<div><slot/></div>' },
  IonCol: { name: 'IonCol', template: '<div><slot/></div>' },
}

describe('ItemGrid', () => {
  it('re-emits add from ItemCard', async () => {
    const item = { id: '1', name: 'Item', price: 1 }
    const ItemCardStub = {
      name: 'ItemCard',
      props: ['item'],
      template: '<div @click="$emit(\'add\', item)"></div>',
    }
    const wrapper = mount(ItemGrid, {
      props: { items: [item] },
      global: { stubs: { ...stubs, ItemCard: ItemCardStub } },
    })
    await wrapper.findComponent(ItemCardStub).trigger('click')
    expect(wrapper.emitted().add[0]).toEqual([item])
  })

  it('renders no items when list empty', () => {
    const ItemCardStub = { name: 'ItemCard', template: '<div />' }
    const wrapper = mount(ItemGrid, {
      props: { items: [] },
      global: { stubs: { ...stubs, ItemCard: ItemCardStub } },
    })
    expect(wrapper.findComponent(ItemCardStub).exists()).toBe(false)
  })
})
