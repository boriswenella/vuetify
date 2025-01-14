import VPagination from '../VPagination'
import {
  mount,
  MountOptions,
  Wrapper,
} from '@vue/test-utils'
import Vue from 'vue'

Vue.prototype.$vuetify = {
  rtl: false,
  icons: {
    values: {
      next: 'mdi-chevron-right',
      prev: 'mdi-chevron-left',
    },
  },
}

describe('VPagination.ts', () => {
  type Instance = InstanceType<typeof VPagination>
  let mountFunction: (options?: MountOptions<Instance>) => Wrapper<Instance>
  beforeEach(() => {
    jest.useFakeTimers()

    mountFunction = (options?: MountOptions<Instance>) => {
      return mount(VPagination, options)
    }
  })

  it('emits an event when next or previous is clicked', async () => {
    const wrapper = mountFunction({
      propsData: {
        length: 5,
        value: 2,
      },
    })
    jest.runAllTimers()

    await wrapper.vm.$nextTick()

    const previous = jest.fn()
    const next = jest.fn()

    wrapper.vm.$on('previous', previous)
    wrapper.vm.$on('next', next)

    const navigation = wrapper.findAll('.v-pagination__navigation').wrappers
    navigation[0].trigger('click')
    navigation[1].trigger('click')

    expect(next).toHaveBeenCalled()
    expect(previous).toHaveBeenCalled()
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should render component in RTL mode and match snapshot', async () => {
    const wrapper = mountFunction({
      propsData: {
        length: 5,
        value: 2,
      },
    })
    wrapper.vm.$vuetify.rtl = true
    await wrapper.vm.$nextTick()

    expect(wrapper.html()).toMatchSnapshot()
    wrapper.vm.$vuetify.rtl = undefined
  })

  it('emits an event when pagination item is clicked', async () => {
    const wrapper = mountFunction({
      propsData: {
        length: 5,
        value: 2,
      },
    })
    jest.runAllTimers()

    await wrapper.vm.$nextTick()

    const cb = jest.fn()

    wrapper.vm.$on('input', cb)

    const navigation = wrapper.findAll('.v-pagination__item').wrappers
    navigation[1].trigger('click')

    expect(cb).toHaveBeenCalledWith(2)
  })

  it('should render disabled buttons with length equals to 0', async () => {
    const wrapper = mountFunction({
      propsData: {
        length: 0,
        value: 1,
      },
    })
    jest.runAllTimers()

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should watch the value', async () => {
    const wrapper = mountFunction({
      propsData: {
        length: 5,
        value: 1,
      },
    })

    jest.runAllTimers()
    expect(wrapper.vm.selected).toBe(1)

    wrapper.setProps({ value: 2 })
    jest.runAllTimers()
    expect(wrapper.vm.selected).toBe(2)
  })

  it('should only render start and end of range if length is big', async () => {
    const wrapper = mountFunction({
      propsData: {
        length: 100,
      },
    })
    jest.runAllTimers()

    await wrapper.vm.$nextTick()

    expect(wrapper.html()).toMatchSnapshot()
    expect(wrapper.findAll('.v-pagination__more').wrappers).toHaveLength(1)
  })

  it('should only render middle of range if length is big and value is somewhere in the middle', async () => {
    const wrapper = mountFunction({
      propsData: {
        length: 100,
        value: 50,
      },
    })
    jest.runAllTimers()

    await wrapper.vm.$nextTick()

    expect(wrapper.html()).toMatchSnapshot()
    expect(wrapper.findAll('.v-pagination__more').wrappers).toHaveLength(2)
  })

  it('should only render start of range if value is equals "left"', async () => {
    const wrapper = mountFunction({
      propsData: {
        length: 100,
        totalVisible: 5,
      },
    })
    const maxLength = wrapper.vm.totalVisible
    const left = Math.floor(maxLength / 2)
    wrapper.setProps({ value: left })
    jest.runAllTimers()

    await wrapper.vm.$nextTick()

    expect(wrapper.html()).toMatchSnapshot()
    expect(wrapper.findAll('.v-pagination__more').wrappers).toHaveLength(1)
  })

  it('should only render end of range if value is equals "right"', async () => {
    const wrapper = mountFunction({
      propsData: {
        length: 100,
        totalVisible: 5,
      },
    })
    const maxLength = wrapper.vm.totalVisible
    const even = maxLength % 2 === 0 ? 1 : 0
    const left = Math.floor(maxLength / 2)
    const right = wrapper.vm.length - left + 1 + even
    wrapper.setProps({ value: right })
    jest.runAllTimers()

    await wrapper.vm.$nextTick()

    expect(wrapper.html()).toMatchSnapshot()
    expect(wrapper.findAll('.v-pagination__more').wrappers).toHaveLength(1)
  })

  it('should use totalVisible prop if defined', async () => {
    const wrapper = mountFunction({
      propsData: {
        length: 100,
        value: 50,
        totalVisible: 10,
      },
    })
    jest.runAllTimers()

    await wrapper.vm.$nextTick()

    expect(wrapper.html()).toMatchSnapshot()
    expect(wrapper.findAll('.v-pagination__more').wrappers).toHaveLength(2)
    expect(wrapper.findAll('.v-pagination__item').wrappers).toHaveLength(8)
  })

  it('should set from to 1 if <= 0', () => {
    const wrapper = mountFunction()

    expect(wrapper.vm.range(1, 2)).toEqual([1, 2])
    expect(wrapper.vm.range(0, 2)).toEqual([1, 2])
  })

  // Since we have no DOM access, test the expected outcome
  // even if it's not real world, so that we can detect changes
  it('should use parents width for on resize calculation', () => {
    const wrapper = mount({
      functional: true,
      render: h => h('div', [h(VPagination)]),
    })

    const pagination = wrapper.find(VPagination.options)

    expect(pagination.vm.maxButtons).toBe(0)

    pagination.vm.onResize()

    expect(pagination.vm.maxButtons).toBe(-3)
  })
})
