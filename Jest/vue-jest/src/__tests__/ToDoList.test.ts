import { mount } from "@vue/test-utils";
import { expect, test } from "vitest";

import ToDoList from '@/components/ToDoList.vue'


test("新增代办事项", async () => {
  const wrapper = mount(ToDoList)

  // 生产快照
  expect(wrapper.element).toMatchSnapshot()

  const todo = wrapper.get('[data-test="todo"]')

  expect(todo.text()).toBe("Learn Vue.js 3")


  // 测试新增
  await wrapper.get('[data-test="new-todo"]').setValue("Learn Vitest")
  // 触发submit事件
  await wrapper.get('[data-test="form"]').trigger('submit')

  // 获取到所有的代办事项
  const todos = wrapper.findAll('[data-test="todo"]')

  // 断言
  expect(todos).toHaveLength(2)
})
