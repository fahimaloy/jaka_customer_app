import { mount } from '@vue/test-utils'
import CategoryList from '../components/CategoryList.vue'

describe('CategoryList', () => {
  const stubs = {
    IonSegment: { name: 'IonSegment', template: '<div @ionChange="$emit(\'ionChange\', $event)"><slot/></div>' },
    IonSegmentButton: { name: 'IonSegmentButton', props: ['value'], template: '<button :value="value"><slot/></button>' },
    IonLabel: { name: 'IonLabel', template: '<span><slot/></span>' },
  }

  it('emits select with category id', async () => {
    const wrapper = mount(CategoryList, {
      props: { categories: [{ id: 'c1', name: 'Cat' }], selected: null },
      global: { stubs },
    })
    await wrapper.findComponent({ name: 'IonSegment' }).vm.$emit('ionChange', { detail: { value: 'c1' } })
    expect(wrapper.emitted().select[0]).toEqual(['c1'])
  })

  it('emits null when no value', async () => {
    const wrapper = mount(CategoryList, {
      props: { categories: [], selected: null },
      global: { stubs },
    })
    await wrapper.findComponent({ name: 'IonSegment' }).vm.$emit('ionChange', { detail: {} })
    expect(wrapper.emitted().select[0]).toEqual([null])
  })
})
