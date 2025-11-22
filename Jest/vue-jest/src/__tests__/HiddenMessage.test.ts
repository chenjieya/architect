import { mount } from '@vue/test-utils';
import { test, expect } from 'vitest';
import HiddenMessage from '@/components/HiddenMessage.vue';

test("正确的渲染出来",  () => {
  const wrapper = mount(HiddenMessage)

  expect(wrapper.find('label').text()).toBe("显示说明")
  expect(wrapper.find('input').attributes('type')).toBe('checkbox')

})


test("默认不展示信息",  () => {
  const wrapper = mount(HiddenMessage)

  expect(wrapper.find('#showMessage').exists()).toBe(true)
  expect(wrapper.find('#showMessage').text()).toBe("")
})

test("点击复选框之后能够展示信息内容",  async () => {
  const wrapper = mount(HiddenMessage, {
    slots: {
      default: "<p>This is a slots</p>"
    }
  })

  await wrapper.find("#toggle").trigger('click')

  expect(wrapper.find("#showMessage").text()).toBe("This is a slots")

  // 再次触发点击事件，应当隐藏内容
  await wrapper.find("#toggle").trigger("click")
  expect(wrapper.find("#showMessage").text()).toBe("")

})


