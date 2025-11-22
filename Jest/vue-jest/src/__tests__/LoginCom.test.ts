import { mount } from "@vue/test-utils";
import { test, expect, vi, afterEach } from "vitest";

import LoginComp from "../components/LoginComp.vue";

// 前期准备
const testToken = { token: "abc123" };
window.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve(testToken)
})

afterEach(() => {
  window.localStorage.removeItem('token')
})



test("测试请求成功", async () => {
  const wrapper = mount(LoginComp);

  wrapper.find("#usernameInput").setValue("admin");
  wrapper.find("#passwordInput").setValue("123455");

  await wrapper.find('form').trigger('submit')

  await wrapper.vm.$nextTick();
  await new Promise((resolve) => setTimeout(resolve, 300))

  expect(wrapper.find('[role="alert"]').text()).toMatch(/Congrats/i)
  expect(window.localStorage.getItem("token")).toBe(testToken.token)

});

test("测试请求失败", async () => {
  window.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.reject({ message: "服务器内部错误" })
  })


  const wrapper = mount(LoginComp);

  wrapper.find("#usernameInput").setValue("admin");
  wrapper.find("#passwordInput").setValue("123455");

  await wrapper.find('form').trigger('submit')

  await wrapper.vm.$nextTick();
  await new Promise((resolve) => setTimeout(resolve, 300))

  expect(wrapper.find('[role="alert"]').text()).toMatch("服务器内部错误")
  expect(window.localStorage.getItem("token")).toBeNull()

});

