---
author: human
ai_editable: false
updated_by: human
updated: 2026-08-02
---

## 1. 经典真题

- 介绍下 _BFC_ 及其应用
- 介绍下 _BFC、IFC、GFC_ 和 _FFC_

## 2. 搞懂各种 _FC_

一看到 _BFC、IFC、GFC_ 和 _FFC_，大家可能会想到 _KFC_。

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20260224132201877.png)

然而这里所说的 _xFC_ 和 _KFC_ 没有任何关系。

那么这些 _FC_ 究竟是啥呢？

不着急，我们先搞懂一个，后面的陆陆续续也就融会贯通了。

我们首先就来看这个 _BFC_，英语全称 _Block formatting contexts_，翻译成中文就是“块级格式化上下文”。

简单来说，就是页面中的一块渲染区域，并且有一套属于自己的渲染规则，它决定了元素如何对齐内容进行布局，以及与其他元素的关系和相互作用。 当涉及到可视化布局的时候，_BFC_ 提供了一个环境，_HTML_ 元素在这个环境中按照一定规则进行布局。

再简短一点，那就是：**_BFC_ 是一个独立的布局环境，_BFC_ 内部的元素布局与外部互不影响**

这就好比你在你自己家里面，你想怎么摆放你的家具都可以，你家的家具布局并不会影响邻居家的家具布局。

当然，虽然说 _BFC_ 是一个独立的布局环境，里外不影响，但也不是意味着布局没有章法，基本的规矩还是要有的。

例如，_BFC_ 的布局规则有如下几条：

1. 内部的 _Box_ 会在垂直方向一个接着一个地放置。
2. _Box_ 垂直方向上的距离由 _margin_ 决定。属于同一个 _BFC_ 的两个相邻的 _Box_ 的 _margin_ 会发生重叠。
3. 每个盒子的左外边框紧挨着包含块的左边框，即使浮动元素也是如此。
4. _BFC_ 的区域不会与浮动 _Box_ 重叠。
5. _BFC_ 就是页面上的一个隔离的独立容器，容器里面的子元素不会影响到外面的元素，反之亦然。
6. 计算 _BFC_ 的高度时，浮动子元素也参与计算。

诶？？

这好像在我们的 _body_ 元素里面，盒子天然就是这样的布局规则呀？

没错，实际上在一个标准流中 _body_ 元素就是一个天然的 _BFC_。

那么如果其他区域，我想单独设置成一个 _BFC_，该怎么办呢？这里记录了一些常见的方式：

| 元素或属性 | 属性值                     |
| ---------- | -------------------------- |
| 根元素     |                            |
| _float_    | _left、right_              |
| _postion_  | _absolute、fixed_          |
| _overflow_ | _auto、scroll、hidden_     |
| _display_  | _inline-block、table-cell_ |

> 上面只记录了一些常见的方式，完整的 _BFC_ 触发方式可以参阅：*https://developer.mozilla.org/zh-CN/docs/Web/Guide/CSS/Block_formatting_context*

那么块级格式化上下文有啥具体的用处呢？我们来看几个场景

1. 解决浮动元素令父元素高度坍塌的问题

```html
<div class="father">
  <div class="son"></div>
</div>
```

```css
.father {
  border: 5px solid;
}
.son {
  width: 100px;
  height: 100px;
  background-color: blue;
  float: left;
}
```

在上面的代码中，父元素的高度是靠子元素撑起来的，但是一旦我们给子元素设置了浮动，那么父元素的高度就塌陷了。如下：

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20260224132209969.png)

此时我们就可以将父元素设置成一个 _BFC_，例如：

```css
.father {
  border: 5px solid;
  overflow: hidden;
  /* 将父元素设置为一个 BFC */
}
.son {
  width: 100px;
  height: 100px;
  background-color: blue;
  float: left;
}
```

效果：可以看到由于父元素变成 _BFC_，高度并没有产生塌陷了，其原因是在计算 _BFC_ 的高度时，浮动子元素也参与计算

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20260224132216834.png)

2. 非浮动元素被浮动元素覆盖

```html
<div class="box1"></div>
<div class="box2"></div>
```

```css
.box1 {
  width: 100px;
  height: 50px;
  background-color: red;
  float: left;
}
.box2 {
  width: 50px;
  height: 50px;
  background-color: blue;
}
```

在上面的代码中，由于 _box1_ 设置了浮动效果，所以会脱离标准流，自然而然 _box2_ 会往上面跑，结果就被高度和自己一样的 _box1_ 给挡住了。

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20260224132222686.png)

接下来我们设置 _box2_ 为 _BFC_，如下：

```css
.box1 {
  width: 100px;
  height: 50px;
  background-color: red;
  float: left;
}
.box2 {
  width: 50px;
  height: 50px;
  background-color: blue;
  overflow: hidden;
}
```

效果：由于 _BFC_ 的区域不会与浮动 _box_ 重叠，所以即使 _box1_ 因为浮动脱离了标准流，_box2_ 也不会被 _box1_ 遮挡

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20260224132230752.png)

基于此特点，我们就可以制作两栏自适应布局，方法就是给固定栏设置固定宽度，给不固定栏开启 _BFC_。

```html
<div class="left">导航栏</div>
<div class="right">这是右侧</div>
```

```css
* {
  margin: 0;
  padding: 0;
}
.left {
  width: 200px;
  height: 100vh;
  background-color: skyblue;
  float: left;
}

.right {
  width: calc(100% - 200px);
  height: 100vh;
  background-color: yellowgreen;
}
```

效果：在上面的代码中，我们要设置两栏布局，左边栏宽度固定，右边栏自适应。结果我们发现右侧出现了空白

究其原因就是右侧区域与浮动盒子重叠了

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20260224132238583.png)

修改 _.right_ 部分的代码，添加 _overflow:hidden_ 使其成为一个 _BFC_：

```css
.right {
  width: calc(100% - 200px);
  height: 100vh;
  background-color: yellowgreen;
  overflow: hidden;
}
```

效果：因为 _BFC_ 的区域不会与浮动 _Box_ 重叠，所以右侧空白没有了

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20260224132249151.png)

3. 外边距垂直方向重合的问题

_BFC_ 还能够解决 _margin_ 折叠的问题，例如：

```html
<div class="box1"></div>
<div class="box2"></div>
```

```css
* {
  margin: 0;
  padding: 0;
}

.box1 {
  width: 100px;
  height: 100px;
  background-color: red;
  margin-bottom: 10px;
}
.box2 {
  width: 100px;
  height: 100px;
  background-color: blue;
  margin-top: 10px;
}
```

效果：

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20260224132256014.png)

此时我们可以在 box2 外部再包含一个 div，并且将这个 div 设置为 _BFC_，如下：

```html
<div class="box1"></div>
<div class="container">
  <div class="box2"></div>
</div>
```

```css
* {
  margin: 0;
  padding: 0;
}

.box1 {
  width: 100px;
  height: 100px;
  background-color: red;
  margin-bottom: 10px;
}
.box2 {
  width: 100px;
  height: 100px;
  background-color: blue;
  margin-top: 10px;
}
.container {
  overflow: hidden;
}
```

效果：

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20260224132302204.png)

_OK_，到这里你应该明白什么是 _BFC_ 以及 _BFC_ 的触发规则和其使用场景了。

明白了 _BFC_，那么其他的 _IFC、GFC_ 和 _FFC_ 也就大同小异了。

- _IFC_（_Inline formatting context_）：翻译成中文就是“行内格式化上下文”，也就是一块区域以行内元素的形式来格式化
- _GFC_（_GrideLayout formatting contexts_）：翻译成中文就是“网格布局格式化上下文”，将一块区域以 _grid_ 网格的形式来格式化
- _FFC_（_Flex formatting contexts_）：翻译成中文就是“弹性格式化上下文“，将一块区域以弹性盒的形式来格式化

> 更多关于格式化上下文的内容，可以参阅 _MDN_：
>
> _BFC_：*https://developer.mozilla.org/zh-CN/docs/Web/Guide/CSS/Block_formatting_context*
>
> _IFC_：*https://developer.mozilla.org/zh-CN/docs/Web/CSS/Inline_formatting_context*

## 3. 真题解答

- 介绍下 _BFC_ 及其应用

> 参考答案：
>
> 所谓 _BFC_，指的是一个独立的布局环境，_BFC_ 内部的元素布局与外部互不影响。
>
> 触发 _BFC_ 的方式有很多，常见的有：
>
> - 设置浮动
> - _overflow_ 设置为 _auto、scroll、hidden_
> - _positon_ 设置为 _absolute、fixed_
>
> 常见的 _BFC_ 应用有：
>
> - 解决浮动元素令父元素高度坍塌的问题
> - 解决非浮动元素被浮动元素覆盖问题
> - 解决外边距垂直方向重合的问题

- 介绍下 _BFC、IFC、GFC_ 和 _FFC_

> 参考答案：
>
> - _BFC_：块级格式上下文，指的是一个独立的布局环境，_BFC_ 内部的元素布局与外部互不影响。
> - _IFC_：行内格式化上下文，将一块区域以行内元素的形式来格式化。
> - _GFC_：网格布局格式化上下文，将一块区域以 _grid_ 网格的形式来格式化
> - _FFC_：弹性格式化上下文，将一块区域以弹性盒的形式来格式化

-_EOF_-
