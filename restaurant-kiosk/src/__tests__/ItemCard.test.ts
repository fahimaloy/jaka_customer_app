import { mount } from '@vue/test-utils'
import ItemCard from '../components/ItemCard.vue'

const stubs = {
  IonCard: { name: 'IonCard', template: '<div><slot/></div>' },
  IonCardHeader: { name: 'IonCardHeader', template: '<div><slot/></div>' },
  IonCardTitle: { name: 'IonCardTitle', template: '<div><slot/></div>' },
  IonCardContent: { name: 'IonCardContent', template: '<div><slot/></div>' },
  IonImg: { name: 'IonImg', props: ['src'], template: '<img :src="src" />' },
  IonButton: { name: 'IonButton', template: '<button @click="$emit(\'click\')"><slot/></button>' },
}

describe('ItemCard', () => {
  const item = { id: '1', name: 'Item', price: 1 }

  it('emits add when button clicked', async () => {
    const wrapper = mount(ItemCard, {
      props: { item },
      global: { stubs },
    })
    await wrapper.findComponent({ name: 'IonButton' }).trigger('click')
    expect(wrapper.emitted().add[0]).toEqual([item])
  })

  it('uses placeholder image when missing', () => {
    const wrapper = mount(ItemCard, {
      props: { item },
      global: { stubs },
    })
    const img = wrapper.find('img')
    expect(img.attributes('src')).toContain('placehold.co')
  })
})
