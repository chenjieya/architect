---
author: human
ai_editable: false
updated_by: human
updated: 2026-08-02
---

在通过 vuecli 创建 vue 项目的时候，我们可以很轻松的将 jest 测试框架集成进去。

之前我们在介绍测试 React 组件的时候，介绍了 testing library 这个扩展库，这个 testing library 是一个通用库，因此这个扩展库可以用于 vue、angular...

但是本小节我们要介绍另外一个库，这个库叫做 vue test utils，这个库是专门针对测试 vue 组件的扩展库，因此在这个库中，专门提供了面向 vue 组件对应的 API 和工具。

官网地址：https://test-utils.vuejs.org/

如果你不是新项目，而是已有的项目，那么首先第一步需要安装测试工具库，安装的时候注意一下版本：

- [Vue Test Utils 1](https://github.com/vuejs/vue-test-utils/) targets [Vue 2](https://github.com/vuejs/vue/).
- [Vue Test Utils 2](https://github.com/vuejs/test-utils/) targets [Vue 3](https://github.com/vuejs/vue-next/).

_Vue Test Utils_ 可以与各种测试框架一起使用，如 _Jest、Mocha、AVA_ 等。它还支持在 _Node.js_ 环境和浏览器中运行测试。

以下是 _Vue Test Utils_ 的一些主要功能：

1. 模拟用户操作：_Vue Test Utils_ 提供了一组 _API_，如 _wrapper.trigger( )_ 和 _wrapper.setProps( )_，可以模拟用户在组件上执行的各种操作，如点击、输入、滚动等。
2. 访问组件实例：_Vue Test Utils_ 可以让你获得组件实例，然后你可以检查它们的状态、计算属性、方法等。你可以使用 _wrapper.vm_ 访问组件实例。
3. 断言组件渲染结果：_Vue Test Utils_ 提供了一组 _API_，如 _wrapper.find( )_ 和 _wrapper.contains( )_，可以检查组件是否渲染了正确的内容。你还可以使用 _wrapper.html( )_ 获取组件的 _HTML_ 代码，以便于在测试中进行比较。
4. 支持插件：_Vue Test Utils_ 支持 _Vue.js_ 插件，你可以使用 _localVue.use( )_ 在测试中安装插件。
5. 支持异步操作：_Vue Test Utils_ 支持异步操作，你可以使用 _wrapper.vm.$nextTick( )_ 等方法等待异步操作完成后再进行测试断言。

_Vue Test Utils_ 提供了丰富的 _API_，可以帮助你编写高质量的 _Vue.js_ 组件测试。它可以让你轻松测试组件的各种行为和渲染结果，并且易于集成到你的测试工作流程中。

## 1. 快速上手

我们这里直接来看内置的测试示例：

```ts
import { shallowMount } from "@vue/test-utils";
import HelloWorld from "@/components/HelloWorld.vue";

describe("HelloWorld.vue", () => {
  it("renders props.msg when passed", () => {
    const msg = "new message";
    const wrapper = shallowMount(HelloWorld, {
      props: { msg },
    });
    expect(wrapper.text()).toMatch(msg);
  });
});
```

首先第一步从 @vue/test-utils 库中解构出来了 shallowMount，与之对应的还有一个方法是 mount。

mount 代表渲染一个组件，shallowMount 代表浅渲染，也就是不会去渲染子组件。这两个方法就相当于之前 testing library 里面的 render 方法。

当我们使用 mount 或者 shallowMount 渲染组件之后，会得到一个对象，这个对象我们称之为 wrapper 对象，该对象上面提供了一系列的方法，方便我们来访问和操作组件的属性、样式以及渲染结果之类的。

常用的方法如下：

- _find(selector)_: 在组件的渲染结果中查找符合选择器的元素。
- _findAll(selector)_: 在组件的渲染结果中查找所有符合选择器的元素。
- _trigger(eventType, eventData)_: 触发组件的事件。
- _setProps(props)_: 设置组件的属性。
- _setData(data)_: 设置组件的数据。
- _text( )_: 获取组件的文本内容。
- _html( )_: 获取组件的 _HTML_ 代码。

接下来我们再来写一个例子。首先我们还是写一个 todolist，组件代码如下：

```vue
<template>
  <div>
    <!-- 渲染待办事项每一条项目 -->
    <div v-for="todo in todos" :key="todo.id" data-test="todo">
      {{ todo.text }}
    </div>

    <form data-test="form" @submit.prevent="createTodo">
      <input data-test="new-todo" v-model="newTodo" />
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
const newTodo = ref("");
// 默认的待办事项
const todos = ref([
  {
    id: 1,
    text: "Learn Vue.js 3",
    completed: false,
  },
]);
function createTodo() {
  todos.value.push({
    id: 2,
    text: newTodo.value,
    completed: false,
  });
  newTodo.value = "";
}
</script>

<style scoped></style>
```

接下来，针对这个组件书写如下的测试代码：

```ts
import { shallowMount } from "@vue/test-utils";
import ToDoList from "@/components/ToDoList.vue";

test("测试新增待办事项", async () => {
  const wrapper = shallowMount(ToDoList);
  const todo = wrapper.get('[data-test="todo"]');
  // 因为一开始只有一条待办事项
  expect(todo.text()).toBe("Learn Vue.js 3");

  // act
  // 接下来来测试新增
  await wrapper.get('[data-test="new-todo"]').setValue("New To Do Item");
  // 触发 submit 事件
  await wrapper.get('[data-test="form"]').trigger("submit");

  // assert
  expect(wrapper.findAll('[data-test="todo"]')).toHaveLength(2);
});
```

在上面的测试代码中，我们使用了 shallowMount 来渲染组件，渲染完成后得到一个 wrapper 对象，通过 wrapper 对象的 get 以及 findAll 来查找 DOM，之后进行断言。

需要注意一个问题，使用 vue cli 搭建的项目，在集成 jest 的时候默认配置的只检查 .spec 的文件，如果想要检测 .test 类型的文件，需要进行配置，这里我们在 jest.config.js 里面进行一个配置，配置如下：

```js
module.exports = {
  // ...
  testMatch: ["**/tests/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
};
```

## 2. 测试快照

生成测试快照代码如下：

```ts
expect(wrapper.element).toMatchSnapshot();
```

## 3. 更多示例

这里我们将之前测试 React 组件所写的两个组件改成 Vue3 版本，并且进行测试。

**示例一**

首先是组件代码，如下：

```vue
<template>
  <div>
    <label htmlFor="toggle">显示说明</label>
    <input
      id="toggle"
      type="checkbox"
      :checked="showMessage"
      @click="showMessage = !showMessage"
    />
    <div id="showMessage">
      <slot v-if="showMessage"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
const showMessage = ref(false);
</script>

<style scoped></style>
```

接下来针对这个组件书写如下的测试代码：

```ts
import { shallowMount } from "@vue/test-utils";
import HiddenMessage from "@/components/HiddenMessage.vue";

test("正确的渲染出来", () => {
  const wrapper = shallowMount(HiddenMessage);
  expect(wrapper.find("label").text()).toBe("显示说明");
  expect(wrapper.find("input").attributes("type")).toBe("checkbox");
});

test("默认不显示信息", () => {
  const wrapper = shallowMount(HiddenMessage);
  expect(wrapper.find("#showMessage").exists()).toBe(true);
  expect(wrapper.find("#showMessage").text()).toBe("");
});

test("点击复选框之后能够显示信息", async () => {
  const wrapper = shallowMount(HiddenMessage, {
    slots: {
      default: "<p>这是一段说明文字</p>",
    },
  });
  const checkbox = wrapper.find("input");
  await checkbox.trigger("click");
  expect(wrapper.find("#showMessage").text()).toBe("这是一段说明文字");
  await checkbox.trigger("click");
  expect(wrapper.find("#showMessage").text()).toBe("");
});
```

在上面的测试代码中，我们书写了 3 个测试用例，分别测试了“组件是否正确渲染”“组件默认的状态”以及“组件功能是否正常”

**示例二**

组件代码如下：

```vue
<template>
  <div>
    <form @submit.prevent="handleSubmit">
      <div>
        <label for="usernameInput">Username</label>
        <input id="usernameInput" v-model="username" />
      </div>
      <div>
        <label for="passwordInput">Password</label>
        <input id="passwordInput" type="password" v-model="password" />
      </div>
      <button type="submit">Submit{{ state.loading ? "..." : null }}</button>
    </form>
    <div v-if="state.error" role="alert">{{ state.error }}</div>
    <div v-if="state.resolved" role="alert">Congrats! You're signed in!</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

interface LoginState {
  resolved: boolean;
  loading: boolean;
  error: string | null;
}

const username = ref("");
const password = ref("");
const state = ref<LoginState>({
  resolved: false,
  loading: false,
  error: null,
});

function handleSubmit() {
  state.value.loading = true;
  state.value.resolved = false;
  state.value.error = null;

  window
    .fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username.value,
        password: password.value,
      }),
    })
    .then((r) => r.json().then((data) => (r.ok ? data : Promise.reject(data))))
    .then(
      (user) => {
        state.value.loading = false;
        state.value.resolved = true;
        state.value.error = null;
        localStorage.setItem("token", user.token);
      },
      (error) => {
        state.value.loading = false;
        state.value.resolved = false;
        state.value.error = error.message;
      }
    );
}
</script>

<style scoped></style>
```

该组件主要负责登录，用户填写用户名和密码，通过 fetch 发送请求，之后会对响应的内容做出不同的操作。

下面是针对这个组件进行的测试：

```ts
import { shallowMount } from "@vue/test-utils";
import Login from "@/components/LoginCom.vue";

// 前期准备
const fakeUserResponse = { token: "fake_user_token" };
window.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve(fakeUserResponse),
});

afterEach(() => {
  window.localStorage.removeItem("token");
});

test("请求成功", async () => {
  // arrage
  const wrapper = shallowMount(Login);

  // act 填写表单
  await wrapper.find("#usernameInput").setValue("xiejie");
  await wrapper.find("#passwordInput").setValue("123456");
  await wrapper.find("form").trigger("submit");

  // 等待
  await wrapper.vm.$nextTick();
  await new Promise((resolve) => setTimeout(resolve, 100));

  // assert
  expect(window.localStorage.getItem("token")).toEqual(fakeUserResponse.token);
  expect(wrapper.find('[role="alert"]').text()).toMatch(/Congrats/i);
});

test("请求失败", async () => {
  window.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () =>
      Promise.reject({
        message: "服务器内部错误",
      }),
  });

  // arrage
  const wrapper = shallowMount(Login);

  // act 填写表单
  await wrapper.find("#usernameInput").setValue("xiejie");
  await wrapper.find("#passwordInput").setValue("123456");
  await wrapper.find("form").trigger("submit");

  // 等待
  await wrapper.vm.$nextTick();
  await new Promise((resolve) => setTimeout(resolve, 100));

  // assert
  expect(window.localStorage.getItem("token")).toBeNull();
  expect(wrapper.find('[role="alert"]').text()).toMatch("服务器内部错误");
});
```

这个测试代码主要写了 2 个测试用例，分别测试了请求成功和失败的情况，我们通过 jest.fn 来模拟 fetch 请求，从而避免发送真实的请求。

## 4. 总结

本小节我们主要看了关于 _Vue_ 组件的测试。

对于 _Vue_ 组件，有一个常用的配套库为 _Vue Test Utils_。这是一个专门为 _Vue.js_ 应用程序编写单元测试和集成测试的官方测试工具库。它提供了一系列 _API_，用于模拟用户操作、查询组件和断言测试结果，使得开发人员可以在不需要手动操作应用程序的情况下，自动化地测试 _Vue_ 组件的行为和交互。

_Vue Test Utils_ 的主要功能包括：

1. 渲染组件：提供 _mount_ 和 _shallowMount_ 函数，用于把组件渲染为一个包含测试工具的 _Vue_ 包装器，以便在测试中操作和查询组件。
2. 模拟用户操作：提供 _trigger_ 和 _setValue_ 等方法，用于模拟用户操作组件，如点击按钮、输入文本等。
3. 访问组件实例：提供 _wrapper.vm_ 属性，用于访问组件实例的属性和方法。
4. 修改组件实例：提供 _wrapper.setProps_ 和 _wrapper.setData_ 等方法，用于修改组件实例的属性和状态，以便测试不同的场景。

总之，_Vue Test Utils_ 提供了一整套工具和 _API_，使得开发人员可以轻松编写单元测试和集成测试，并确保 _Vue.js_ 应用程序的稳定性和可靠性。
