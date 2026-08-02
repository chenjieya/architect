---
author: human
ai_editable: false
updated_by: human
updated: 2026-08-02
---

## 1. 经典真题

- _CSS_ 引用的方式有哪些？_link_ 和 _@import_ 的区别？

## 2. 来看看 _import_ 指令是啥

_import_ 指令是用来导入 _CSS_ 样式的。

什么？导入样式不是已经有 _link_ 标签了么？

没错，_link_ 标签可以导入外部 _CSS_ 样式，_import_ 仍然可以导入外部 _CSS_ 样式。

我们首先来看一下 _import_ 的基本用法

1. 在 _HTML_ 文件中导入外部样式

```html
<style>
  @import url("./index.css");
</style>
```

要在 _HTML_ 源代码直接应用 _@import_ 引入外部 _CSS_ 文件，须要将 _@import_ 放入 _style_ 标签

2. 在 _CSS_ 文件中引入另一个 _CSS_ 文件

```css
@import url("./index.css");
/* 后面书写其他样式 */
```

除了 _HTML_ 源代码中使用 _style_ 标签来运用 _@import_，在 _CSS_ 文件代码中依旧可以或许使用 _@import_，这个时候就不须要 _style_ 标签，而是直接应用 _@import_ 就可，这样便可实现一个（多个）_CSS_ 文件中引入套入别的一个（多个）_CSS_ 文件。

3. _@import_ 规则还支持媒体查询，因此可以允许依赖媒体的导入

```css
@import "printstyle.css" print;
/* 只在媒体为 print 时导入 "printstyle.css" 样式表 */
```

```css
@import "mobstyle.css" screen and (max-width: 768px);
/* 只在媒体为 screen 且视口最大宽度 768 像素时导入 "mobstyle.css" 样式表 */
```

看完了 _@import_ 的基本使用后，接下来我们来看一下它和 _link_ 的区别：

1. **_link_ 属于 _HTML_ 标签，而 _@import_ 完全是 _CSS_ 提供的一种方式。**

   _link_ 标签除了可以加载 _CSS_ 外，还可以做很多其它的事情，比如定义 _RSS_，定义 _rel_ 连接属性等，_@import_ 就只能加载 _CSS_ 了。

2. **加载顺序的差别。**

   比如，在 _a.css_ 中使用 _import_ 引用 _b.css_，只有当使用当使用 _import_ 命令的宿主 _css_ 文件 _a.css_ 被下载、解析之后，浏览器才会知道还有另外一个 _b.css_ 需要下载，这时才去下载，然后下载后开始解析、构建 _render tree_ 等一系列操作.

3. **兼容性的差别。**

   由于 _@import_ 是 _CSS2.1_ 提出的所以老的浏览器不支持，_@import_ 只有在 _IE5_ 以上的才能识别，而 _link_ 标签无此问题。

4. **当使用 _JS_ 控制 _DOM_ 去改变样式的时候，只能使用 _link_ 标签，因为 _@import_ 不是 _DOM_ 可以控制的**。

   对于可换皮肤的网站而言，可以通过改变 _link_ 标签这两个的 _href_ 值来改变应用不用的外部样式表，但是对于 _import_ 是无法操作的，毕竟不是标签。

另外，从性能优化的角度来讲，尽量要避免使用 _@import_。

使用 _@import_ 引入 _CSS_ 会影响浏览器的并行下载。使用 _@import_ 引用的 _CSS_ 文件只有在引用它的那个 _CSS_ 文件被下载、解析之后，浏览器才会知道还有另外一个 _CSS_ 需要下载，这时才去下载，然后下载后开始解析、构建 _Render Tree_ 等一系列操作。

多个 _@import_ 会导致下载顺序紊乱。在 _IE_ 中，_@import_ 会引发资源文件的下载顺序被打乱，即排列在 _@import_ 后面的 _JS_ 文件先于 _@import_ 下载，并且打乱甚至破坏 _@import_ 自身的并行下载。

## 3. 真题解答

- _CSS_ 引用的方式有哪些？_link_ 和 _@import_ 的区别？

> 参考答案：
>
> _CSS_ 引用的方式有：
>
> - 外联，通过 _link_ 标签外部链接样式表
> - 内联，在 _head_ 标记中使用 _style_ 标记定义样式
> - 嵌入，在元素的开始标记里通过 _style_ 属性定义样式
>
> _link_ 和 _@import_ 的区别：
>
> 1. **_link_ 属于 _HTML_ 标签，而 _@import_ 完全是 _CSS_ 提供的一种方式。**
>
>    _link_ 标签除了可以加载 _CSS_ 外，还可以做很多其它的事情，比如定义 _RSS_，定义 _rel_ 连接属性等，_@import_ 就只能加载 _CSS_ 了。
>
> 2. **加载顺序的差别。**
>
>    比如，在 _a.css_ 中使用 _import_ 引用 _b.css_，只有当使用当使用 _import_ 命令的宿主 _css_ 文件 _a.css_ 被下载、解析之后，浏览器才会知道还有另外一个 _b.css_ 需要下载，这时才去下载，然后下载后开始解析、构建 _render tree_ 等一系列操作.
>
> 3. **兼容性的差别。**
>
>    由于 _@import_ 是 _CSS2.1_ 提出的所以老的浏览器不支持，_@import_ 只有在 _IE5_ 以上的才能识别，而 _link_ 标签无此问题。
>
> 4. **当使用 _JS_ 控制 _DOM_ 去改变样式的时候，只能使用 _link_ 标签，因为 _@import_ 不是 _DOM_ 可以控制的**。
>
>    对于可换皮肤的网站而言，可以通过改变 _link_ 便签这两个的 _href_ 值来改变应用不用的外部样式表，但是对于 _import_ 是无法操作的，毕竟不是标签。

-_EOF_-
