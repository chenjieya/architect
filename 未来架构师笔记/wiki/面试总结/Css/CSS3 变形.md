---
author: human
ai_editable: false
updated_by: human
updated: 2026-08-02
---

## 1. 经典真题

- 请简述一下 _CSS3_ 中新增的变形如何使用？

## 2. _CSS3_ 变形相关知识

### 2.1 变形介绍

_CSS2.1_ 中的页面都是静态的，多年来，_Web_ 设计师依赖于图片、_Flash_ 或者 _JavaScript_ 才能完成修改页面的外观。_CSS3_ 改变了设计师这种思维，借助 _CSS3_ 可以轻松的倾斜、缩放、移动以及翻转元素。

_2012_ 年 _9_ 月，_W3C_ 组织发布了 _CSS3_ 变形工作草案。允许 _CSS_ 把元素变成 _2D_ 或者 _3D_ 空间，这其实就是 _CSS3_ 的 _2D_ 变形和 _3D_ 变形。

_CSS3_ 变形是一些效果的集合，比如平移、旋转、缩放和倾斜效果，每个效果通过变形函数（_transform function_）来实现。在此之前，要想实现这些效果，必须依赖图片、_Flash_ 或者 _JavaScript_ 才能完成，而现在仅仅使用纯 _CSS_ 就能够实现，大大的提高了开发效率以及页面的执行效率。

变形效果要通过变形函数来实现，语法如下：

```css
transform: none|transform-functions;
```

那么 _CSS3_ 中为我们提供了哪些变形函数呢？

这里我们整体可以划分出 _3_ 大类：

- 具有 _X/Y_ 的函数：_translateX、translateY、sclaeX、scaleY、skewX、skewY_
- _2D_ 变形函数：_translate、sclae、rotate、skew、matrix_
- _3D_ 变形函数：_rotateX、rotateY、rotate3d、translateZ、translate3d、scaleZ、scale3d、matrix3d_

此时，你可能已经做好了逐一击破每个变形函数的思想准备了。

别急，在介绍每个变形函数之前，我们先来了解一下变形相关的属性。

### 2.2 变形属性

1. **_transform_ 属性**

第一个首当其冲的就是 _transform_ 属性，该属性所对应的属性值就是一系列的变形函数，例如：

```css
transform: scale(1.5);
```

上面的代码中，我们设置了 _transform_ 属性，属性值为 _scale_ 变形函数。

2. **_transform-origin_ 属性**

接下来第二个是 _transform-origin_ 属性，该属性用于设置元素的中心点位置。该属性语法如下：

```css
transform-origin: x-axis y-axis z-axis;
```

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20260224132617281.png)

为了演示此属性的作用，我们先透支一点后面的知识。

这里我们以 _rotate_ 为例。_rotate_ 是变形函数中的一个，作用是旋转元素，其语法如下：

```css
rotate(angle)
```

定义 _2D_ 旋转，在参数中规定角度。

来看一个例子：

```html
<div></div>
```

```css
div {
  width: 150px;
  height: 150px;
  background-color: red;
  margin: 200px;
  transition: all 1s;
}
div:hover {
  transform: rotate(45deg);
}
```

效果如下：

<img src="https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2021-09-19-080641.gif" alt="2021-09-19 16.06.26" style="zoom:50%;" />

在上面的示例中，我们设置 _div_ 鼠标 _hover_ 的时候进行变形，旋转 _45_ 度，为了更加平滑，我们加入了 _transition_ 过渡效果。

我们观察整个元素的旋转中心点，是在元素的最中央。

接下来我们可以使用 _transform-origin_ 来修改这个中心点的位置。例如：

```css
div {
  width: 150px;
  height: 150px;
  background-color: red;
  margin: 200px;
  transition: all 1s;
  transform-origin: bottom left;
  /* 修改元素的中心点位置 */
}
div:hover {
  transform: rotate(45deg);
}
```

效果如下：

<img src="https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2021-09-19-081002.gif" alt="2021-09-19 16.09.46" style="zoom:50%;" />

在上面的代码中，我们修改了元素的中心点位置为 _bottom、left_，也就是左下角。可以看到因为元素的中心点位置发生了变化，旋转的方式也随之发生了改变。

_transform-origin_ 的属性值除了像上面一样设置关键词以外，也可以是百分比、_em、px_ 等具体的值。

_transform-origin_ 的第三个参数是定义 _Z_ 轴的距离，这在后面介绍 _3D_ 变形时再来介绍。

3. **_transform-style_ 属性**

_transform-style_ 属性是 _3D_ 空间一个重要属性，指定了嵌套元素如何在 _3D_ 空间中呈现。语法如下：

```css
transform-style: flat | preserve-3d;
```

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20260224132628804.png)

其中 _flat_ 为默认值。

需要注意的是该属性需要设置在父元素上面，使其变成一个真正的 _3D_ 图形。

当然光看属性说明是非常模糊的，一点都不直观，我们直接来看一个例子。

```html
<div class="box">
  <div class="up">上</div>
  <div class="down">下</div>
  <div class="left">左</div>
  <div class="right">右</div>
  <div class="forword">前</div>
  <div class="back">后</div>
</div>
```

```css
.box {
  width: 250px;
  height: 250px;
  border: 1px dashed red;
  margin: 100px auto;
  position: relative;
  border-radius: 50%;
  transform-style: preserve-3d;
  animation: gun 8s linear infinite;
}

.box > div {
  width: 100%;
  height: 100%;
  position: absolute;
  text-align: center;
  line-height: 250px;
  font-size: 60px;
  color: #daa520;
}

.left {
  background-color: rgba(255, 0, 0, 0.3);
  transform-origin: left;
  transform: rotateY(90deg) translateX(-125px);
}

.right {
  background: rgba(0, 0, 255, 0.3);
  transform-origin: right;
  /* 变换*/
  transform: rotateY(90deg) translateX(125px);
}
.forward {
  background: rgba(255, 255, 0, 0.3);
  transform: translateZ(125px);
}
.back {
  background: rgba(0, 255, 255, 0.3);
  transform: translateZ(-125px);
}
.up {
  background: rgba(255, 0, 255, 0.3);
  transform: rotateX(90deg) translateZ(125px);
}
.down {
  background: rgba(99, 66, 33, 0.3);
  transform: rotateX(-90deg) translateZ(125px);
}
@keyframes gun {
  0% {
    transform: rotateX(0deg) rotateY(0deg);
  }

  100% {
    transform: rotateX(360deg) rotateY(360deg);
  }
}
```

效果如下：

<img src="https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2021-09-19-092030.gif" alt="2021-09-19 17.20.08" style="zoom:50%;" />

上面的 _CSS_ 代码不用具体去关心，我们只看在 _box_ 元素上面添加了一句 _transform-style: preserve-3d_，表示 _box_ 里面的子元素都以 _3D_ 的形式呈现。如果我们把这行代码去除掉或者值修改为 _flat_，效果如下：

<img src="https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2021-09-19-092331.gif" alt="2021-09-19 17.23.06" style="zoom:50%;" />

怎么样？是不是非常直观，一下子就知道 _transform-style_ 属性的作用是什么了。该属性就是指定子元素是在 _3D_ 空间还是 _2D_ 平面中显示。

4. **_perspective_ 属性**

_perspective_ 属性用于设置查看者的位置，可以将可视内容映射到一个视锥上，继而投到一个 _2D_ 视平面上。如果不指定该属性，则 _Z_ 轴空间中所有点将平铺到同一个 _2D_ 视平面中，并且在变换结果中将不存在景深概念。

简单理解，就是视距，用来设置用户和元素 _3D_ 空间 _Z_ 平面之间的距离。而其效应由他的值来决定，值越小，用户与 _3D_ 空间 _Z_ 平面距离越近，视觉效果更令人印象深刻；反之，值越大，用户与 _3D_ 空间 _Z_ 平面距离越远，视觉效果就很小。

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20260224132639333.png)

注意当为元素定义 _perspective_ 属性时，其子元素会获得透视效果，而不是元素本身。

我们还是来看一个直观的例子来了解这个属性的作用。例如：

```html
<div class="container">
  <div class="item"></div>
</div>
```

```css
.container {
  width: 500px;
  height: 500px;
  border: 1px solid;
  margin: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.item {
  width: 150px;
  height: 150px;
  background-color: red;
  animation: rotateAnimation 5s infinite;
}
@keyframes rotateAnimation {
  0% {
    transform: rotateY(0deg);
  }
  100% {
    transform: rotateY(360deg);
  }
}
```

效果：

<img src="https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2021-09-19-095136.gif" alt="2021-09-19 17.51.16" style="zoom:50%;" />

在上面的代码中，我们虽然设置了 _div.item_ 沿着 _Y_ 轴进行旋转，但是由于没有设置 _perspective_ 视距，所以看上去就像是 _div_ 盒子在宽度伸缩一样，_3D_ 效果并不明显。

此时我们可以给父元素 _div.container_ 设置 _perspective_ 视距，例如：

```css
.container{
  ...
  perspective: 1200px;
}
```

效果如下：

<img src="https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2021-09-19-095428.gif" alt="2021-09-19 17.54.08" style="zoom:50%;" />

很明显，加入 _perspective_ 视距后，_3D_ 旋转效果更佳的真实。

关于 _perspective_ 的取值，接受一个长度单位大于 _0_，其单位不能为百分比的值。大致能够分为如下 _3_ 种情况：

- _none_ 或者不设置：没有 _3D_ 空间。
- 取值越小：_3D_ 效果越明显，也就是眼睛越靠近真 _3D_。
- 取值无穷大或者为 _0_：与取值为 _none_ 的效果一样。

5. **_perspective-origin_ 属性**

如果理解了上面的 _perspective_ 属性，那么这个 _perspective-origin_ 就非常好理解了，该属性用来决定 _perspective_ 属性的源点角度。

其语法如下：

```css
perspective-origin: x-axis y-axis;
```

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20260224132649568.png)

举个例子：

```css
.container{
  ...
  perspective: 600px;
  perspective-origin: top;
}
```

效果如下：

<img src="https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2021-09-19-124520.gif" alt="2021-09-19 20.45.00" style="zoom:50%;" />

由于我们设置的 _perspective-origin_ 的值为 _top_，所以会呈现一种俯视的效果。如果将其值修改为 _bottom_，则会是仰视的即视感，如下：

<img src="https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2021-09-19-124646.gif" alt="2021-09-19 20.46.34" style="zoom:50%;" />

6. **_backface-visibility_ 属性**

_backface-visibility_ 属性决定元素旋转背面是否可见。对于未旋转的元素，该元素的正面面向观看者。当其旋转 _180_ 度时会导致元素的背面面向观众。

该属性是设置在旋转的元素上面，语法如下：

```css
backface-visibility: visible|hidden;
```

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20260224132657304.png)

来看一个具体的例子：

```css
.item{
  ...
  backface-visibility: hidden;
}
```

效果：

<img src="https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2021-09-19-133845.gif" alt="2021-09-19 21.38.25" style="zoom:50%;" />

在上面的代码中，我们在子元素 _div.item_ 上设置了 _backface-visibility: hidden_，当此元素旋转 _180_ 度到背面时，我们可以发现此时是无法看到背面的。

### 2.3 _2D_ 变形

介绍完 _CSS3_ 中变形的相关属性后，接下来我们就该来看一下具体的变形函数了。

整个 CSS3 为我们提供了相当丰富的变形函数，有 _2D_ 的，有 _3D_ 的。这里我们先来看 _2D_ 的变形函数。

#### 2.3.1 _2D_ 位移

_2D_ 位移对应有 _3_ 个变形函数，分别是 _translate、translateX、translateY_

用法也非常简单，_translate_ 方法从其当前位置移动元素（根据为 _X_ 轴和 _Y_ 轴指定的参数）。

```css
div {
  transform: translate(50px, 100px);
}
```

上面的例子把 _div_ 元素从其当前位置向右移动 _50_ 个像素，并向下移动 _100_ 个像素：效果如下：

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20260224132723486.png)

#### 2.3.2 _2D_ 缩放

_2D_ 缩放对应的也有 _3_ 个变形函数，分别是 _sclae、sclaeX、sclaeY_

该方法能够按照倍数放大或缩小元素的大小（根据给定的宽度和高度参数）。默认值为 _1_，小于这个值就是缩小，大于这个值就是放大。

```css
div {
  transform: scale(2, 3);
}
```

上面的例子把 _div_ 元素增大为其原始宽度的两倍和其原始高度的三倍，效果如下：

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20260224132738017.png)

#### 2.3.3 _2D_ 旋转

_2D_ 旋转对应的只有 _1_ 个变形函数 _rotate_，这个我们在前面也已经用过了。

该变形函数只接受一个值代表旋转的角度值，取值可正可负，正值代表顺时针旋转，负值代表逆时针旋转。

```css
div {
  transform: rotate(20deg);
}
```

上面的例子把 _div_ 元素顺时针旋转 _20_ 度，效果如下：

![Rotate](https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2021-09-19-135300.png)

#### 2.3.4 _2D_ 倾斜

_2D_ 倾斜对应的变形函数也是 _3_ 个，分别是 _skew、skewX、skewY_

语法如下：

```css
skew(ax, ay)
```

- _ax_：指定元素水平方向（_X_ 轴方向）倾斜角度
- _ay_：指定元素垂直方向（_Y_ 轴方向）倾斜角度

```html
<div></div>
```

```css
div {
  width: 150px;
  height: 150px;
  background-color: red;
  margin: 150px;
  transition: all 1s;
}
div:hover {
  transform: skew(20deg);
}
```

效果如下：

<img src="https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2021-09-19-140231.gif" alt="2021-09-19 22.02.15" style="zoom:50%;" />

### 2.4 _2D_ 矩阵

虽然 _CSS3_ 为我们提供了上述的变形函数方便我们进行元素的变形操作，但是毕竟函数个数有限，有些效果是没有提供的，例如镜像翻转的效果。此时就轮到 _2D_ 矩阵函数 _matrix_ 登场了。

_matrix_ 有六个参数：

```css
matrix(a,b,c,d,e,f)
```

六个参数对应的矩阵：

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20260224132804281.png)

这六个参数组成的矩阵与原坐标矩阵相乘计算坐标。计算方式如下：

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20260224132810752.png)

什么意思呢 ？_x_ 和 _y_ 是元素中每一个像素的初始原点的坐标，而 _x'_ 和 _y'_ 是通过矩阵变化后得到的新原点坐标。通过中间 _3 x 3_ 变换矩阵，对原先的坐标施加变换，从而得到新的坐标。

_x' = ax+cy+e_，表示变换后的**水平**坐标

_y' = bx+dy+f_，表示变换后的**垂直**位置

在 _CSS3_ 中，上面我们所介绍的所有 _2D_ 变形函数都能够通过这个 _matrix_ 矩阵函数来替代。

**矩阵实现偏移**

我们首先来看通过矩阵实现偏移效果。

偏移效果前后 _x、y_ 与 _x'、y'_ 所对应的坐标公式为：

```
x' = x + 偏移量
y' = y + 偏移量
```

套用上面的公式那么各个参数的取值就应该是：

```
a = 1; b = 0;
c = 0; d = 1;
e = x 偏移量; f = y 偏移量
x' = ax+cy+e = 1x + 0y + x 偏移量 = x + x 偏移量
y' = bx+dy+f = 0x + 1y + y 偏移量 = y + y 偏移量
```

所以换成 _matrix_ 函数就应该是：

```
matrix(1, 0, 0, 1, x 偏移量, y 偏移量)
```

下面来做一个测试：

```html
<div></div>
```

```css
div {
  width: 150px;
  height: 150px;
  background-color: red;
  margin: 150px;
  transition: all 1s;
}
div:hover {
  /* transform: translate(100px, 200px); */
  transform: matrix(1, 0, 0, 1, 100, 200);
}
```

在上面的示例中，使用 _translate_ 和 _matrix_ 两个变形函数的效果一致。

**矩阵实现缩放**

缩放之后 _x、y_ 与 _x'、y'_ 所对应的坐标公式为：

```
x' = x * x 缩放倍数
y’ = y * y 缩放倍数
```

套用上面的公式那就是：

```
a = x缩放倍数; b = 0;
c = 0; d = y 缩放倍数;
e = 0; f = 0;
x' = ax+cy+e = x缩放倍数 * x + 0y + 0 = x缩放倍数 * x
y' = bx+dy+f = 0x + y 缩放倍数 * y + 0 = y 缩放倍数 * y
```

所以换成 _matrix_ 函数就应该是：

```css
matrix(x 缩放倍数, 0, 0, y 缩放倍数, 0, 0);
```

例如：

```html
<div></div>
```

```css
div {
  width: 150px;
  height: 150px;
  background-color: red;
  margin: 150px;
  transition: all 1s;
}
div:hover {
  /* transform: scale(2, 2); */
  transform: matrix(2, 0, 0, 2, 0, 0);
}
```

上面的代码我们分别使用 _scale_ 和矩阵实现了相同的缩放效果。

**矩阵实现旋转**

旋转需要实现

```
水平倾斜角度 =  - 垂直倾斜角度
```

旋转我们用到的变形函数是 _rotate(θ)_，其中 _θ_ 为旋转的角度。套用上面的公式：

```
x' = xcosθ - ysinθ + 0 = xcosθ - ysinθ;
y' = xsinθ + ycosθ + 0 = xsinθ + ycosθ
```

转换为 _matrix_ 的代码为：

```css
matrix(cos(θ), sin(θ), -sin(θ), cos(θ), 0, 0)
```

例如：

```html
<div></div>
```

```css
div {
  width: 150px;
  height: 150px;
  background-color: red;
  margin: 150px;
  transition: all 1s;
}
div:hover {
  /* transform: rotate(45deg); */
  transform: matrix(0.7, 0.7, -0.7, 0.7, 0, 0);
}
```

上面的代码使用了 _rotate_ 和 _matrix_ 来实现旋转 _45_ 度的效果。其中 _sin45_ 和 _cos45_ 的值都为 _0.7_。

**矩阵实现倾斜**

_skew(θx, θy)_ 将一个元素按指定的角度在 _X_ 轴和 _Y_ 轴上倾斜。

倾斜对应的公式为：

```
x' = x + ytan(θx) + 0 = x + ytan(θx)
y' = xtan(θy) + y + 0 = xtan(θy) + y
```

转换为 _matrix_ 的代码为：

```css
matrix(1,tan(θy),tan(θx),1,0,0)
```

例如：

```html
<div></div>
```

```css
div {
  width: 150px;
  height: 150px;
  background-color: red;
  margin: 150px;
  transition: all 1s;
}

div:hover {
  /* transform: skew(20deg); */
  transform: matrix(1, 0, 0.4, 1, 0, 0);
}
```

上面的示例中分别使用 _skew_ 和矩阵 _matrix_ 实现了一致的倾斜效果。

**矩阵实现镜像变形**

前面介绍的效果，_CSS3_ 中都提供了对应的变形函数，但是矩阵真正发挥威力是在没有对应的变形函数时，例如这里要讲的镜像变形。

我们先来看一下各种镜像变化 _x、y_ 与 _x'、y'_ 所对应的关系：

水平镜像，就是 _y_ 坐标不变，_x_ 坐标变负

```
x' = -x;
y' = y;
```

所以：

```
a = -1; b = 0;
c = 0; d = 1;
e = 0; f = 0;
```

具体示例如下：

```html
<div></div>
```

```css
div {
  width: 300px;
  height: 200px;
  margin: 150px;
  transition: all 1s;
  background: url("./ok.png") no-repeat;
  background-position: center;
  background-size: contain;
}

div:hover {
  transform: matrix(-1, 0, 0, 1, 0, 0);
}
```

效果：

<img src="https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2021-09-20-011654.gif" alt="2021-09-20 09.16.38" style="zoom:50%;" />

垂直镜像，就是 _x_ 坐标不变，_y_ 坐标变负

```
x' = x;
y' = -y;
```

所以：

```
a = 1; b = 0;
c = 0; d = -1;
e = 0; f = 0;
```

例如：

```css
... div:hover {
  transform: matrix(1, 0, 0, -1, 0, 0);
}
```

效果：

<img src="https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2021-09-20-011934.gif" alt="2021-09-20 09.19.11" style="zoom:50%;" />

水平镜像 + 倒立就是 y 坐标变负，x 坐标变负

```
x' = -x;
y' = -y;
```

所以：

```
a = -1; b = 0;
c = 0; d = -1;
e = 0; f = 0;
```

例如：

```css
... div:hover {
  transform: matrix(-1, 0, 0, -1, 0, 0);
}
```

效果：

<img src="https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2021-09-20-013005.gif" alt="2021-09-20 09.29.45" style="zoom:50%;" />

_90_ 度旋转 + 镜像就是：

```
x' = y;
y' = x;
```

所以：

```
a = 0; b = 1;
c = 1; d = 0;
e = 0; f = 0;
```

例如：

```css
... div:hover {
  transform: matrix(0, 1, 1, 0, 0, 0);
}
```

效果：

<img src="https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2021-09-20-013140.gif" alt="2021-09-20 09.31.24" style="zoom:50%;" />

_-90_ 度旋转 + 镜像就是：

```
x' = -y;
y' = -x;
```

所以：

```
a = 0; b = -1;
c = -1; d = -0;
e = 0; f = 0;
```

例如：

```css
... div:hover {
  transform: matrix(0, -1, -1, 0, 0, 0);
}
```

效果：

<img src="https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2021-09-20-013304.gif" alt="2021-09-20 09.32.47" style="zoom:50%;" />

通过上面一系列的示例，我们可以发现，使用矩阵 _matrix_ 函数确实更佳灵活，能够写出各种变形效果。

### 2.5 _3D_ 变形

使用二维变形能够改变元素在水平和垂直轴线，然而还有一个轴沿着它，可以改变元素。使用三维变形，可以改变元素在 _Z_ 轴位置。

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20260224132831973.png)

三维变换使用基于二维变换的相同属性，如果熟悉二维变换就会发现，_3D_ 变形的功能和 _2D_ 变换的功能类似。CSS3 中的 3D 变换只要包含以下几类：

- **_3D_ 位移**：包括 _translateZ_ 和 _translate3d_ 两个变形函数。
- **_3D_ 旋转**：包括 _rotateX、rotateY、rotateZ_ 和 _rotate3d_ 这四个变形函数。
- **_3D_ 缩放**：包括 _scaleZ_ 和 _sclae3d_ 两个变形函数。
- **_3D_ 矩阵**：和 _2D_ 变形一样，也有一个 _3D_ 矩阵功能函数 _matrix3d_

#### 2.5.1 _3D_ 位移

我们直接来看合成变形函数 _translate3d_，其语法如下：

```css
translate3d(tx, ty, tz)
```

- _tx_：在 _X_ 轴的位移距离。
- _ty_：在 _Y_ 轴的位移距离。
- _tz_：在 _Z_ 轴的位移距离。值越大，元素离观察者越近，值越小，元素离观察者越远

来看一个具体的示例：

```html
<div class="container">
  <div class="item"></div>
</div>
```

```css
.container {
  width: 400px;
  height: 400px;
  border: 1px solid;
  margin: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
  perspective: 1000px;
}
.item {
  width: 300px;
  height: 200px;
  transition: all 1s;
  background: url("./ok.png") no-repeat;
  background-position: center;
  background-size: contain;
}

.item:hover {
  transform: translate3d(100px, 100px, -500px);
}
```

在上面的代码中，我们设置 _div.item_ 被 _hover_ 的时候进行 _3D_ 位移，也就是 _X、Y、Z_ 轴同时进行移动。注意这里要设置父元素的透视效果，也就是设置 _perspective_ 值，否则看不出 _Z_ 轴的移动效果。效果如下：

<img src="https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2021-09-20-024039.gif" alt="2021-09-20 10.40.24" style="zoom:50%;" />

#### 2.5.2 _3D_ 旋转

在三维变形中，可以让元素在任何轴旋转，对应的变形函数有 _rotateX、rotateY、rotateZ_ 以及 _rotate3d_。

其中 _rotate3d_ 就是前面 _3_ 个变形函数的复合函数。不过出了 _x、y、z_ 这三条轴的参数以外，还接受第四个参数 _a_，表示旋转角度。

```css
rotate3d(x, y, z, a)
```

- _x_：可以是 _0_ 到 _1_ 之间的数值，表示旋转轴 _X_ 坐标方向的矢量。
- _y_：可以是 _0_ 到 _1_ 之间的数值，表示旋转轴 _Y_ 坐标方向的矢量。
- _z_：可以是 _0_ 到 _1_ 之间的数值，表示旋转轴 _Z_ 坐标方向的矢量。
- _a_：表示旋转角度。正的角度值表示顺时针旋转，负值表示逆时针旋转。

下面我们以 _rotateX_ 变形函数为例：

```html
<div class="container">
  <div class="item"></div>
</div>
```

```css
.container {
  width: 400px;
  height: 400px;
  border: 1px solid;
  margin: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
  perspective: 1000px;
}
.item {
  width: 150px;
  height: 150px;
  background-color: red;
  transition: all 1s;
}

.item:hover {
  transform: rotateX(45deg);
}
```

效果如下：

<img src="https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2021-09-21-132328.gif" alt="2021-09-21 21.23.14" style="zoom:50%;" />

#### 2.5.3 _3D_ 缩放

_3D_ 缩放主要有 _sclaeZ_ 和 _scale3d_，其中 _scale3d_ 就是 _scaleX_、_scaleY_ 以及 _scaleZ_ 的复合变形函数。其语法如下：

```css
scale(sx, sy, sz)
```

- _sx_：_X_ 轴上的缩放比例
- _sy_：_Y_ 轴上的缩放比例
- _sz_：_Z_ 轴上的缩放比例

但是 _scaleX_ 和 _scaleY_ 变形效果很明显，但是 _scaleZ_ 却基本看不出有什么效果。原因很简单，_scaleZ_ 是 _Z_ 轴上面的缩放，也就是厚度上面的变化，所以如果不是立方体结构，基本上是看不出来 _Z_ 轴上面的缩放效果的。

一般来讲，我们不会将 _scaleZ_ 和 _scale3d_ 单独使用，因为 _scaleZ_ 和 _scale3d_ 这两个变形函数在单独使用时没有任何效果，需要配合其他的变形函数一起使用时才会有效果。

这里我们以前面那个立方体为例，如下：

```html
<div class="box">
  <div class="up">上</div>
  <div class="down">下</div>
  <div class="left">左</div>
  <div class="right">右</div>
  <div class="forword">前</div>
  <div class="back">后</div>
</div>
```

```css
.box {
  width: 250px;
  height: 250px;
  border: 1px dashed red;
  margin: 100px auto;
  position: relative;
  border-radius: 50%;
  transform-style: preserve-3d;
  transition: all 1s;
  transform: rotateX(45deg) rotateY(45deg);
}

.box:hover {
  transform: rotateX(45deg) rotateY(45deg) scaleZ(0.5);
}

.box > div {
  width: 100%;
  height: 100%;
  position: absolute;
  text-align: center;
  line-height: 250px;
  font-size: 60px;
  color: #daa520;
}

.left {
  background-color: rgba(255, 0, 0, 0.3);
  transform-origin: left;
  transform: rotateY(90deg) translateX(-125px);
}

.right {
  background: rgba(0, 0, 255, 0.3);
  transform-origin: right;
  /* 变换*/
  transform: rotateY(90deg) translateX(125px);
}

.forward {
  background: rgba(255, 255, 0, 0.3);
  transform: translateZ(125px);
}

.back {
  background: rgba(0, 255, 255, 0.3);
  transform: translateZ(-125px);
}

.up {
  background: rgba(255, 0, 255, 0.3);
  transform: rotateX(90deg) translateZ(125px);
}

.down {
  background: rgba(99, 66, 33, 0.3);
  transform: rotateX(-90deg) translateZ(125px);
}
```

效果如下：

<img src="https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2021-09-21-143413.gif" alt="2021-09-21 22.33.57" style="zoom:50%;" />

### 2.6 _3D_ 矩阵

_CSS3_ 中的 _3D_ 矩阵比 _2D_ 矩阵复杂，从二维到三维，在矩阵里 3\*3 变成 4\*4，即 _9_ 到 _16_。

对于 _3D_ 矩阵而言，本质上很多东西与 _2D_ 是一致的，只是复杂程度不一样而已。

对于 _3D_ 缩放效果，其矩阵如下：

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20260224132913485.png)

```css
matrix3d(sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, 0, 0, 0, 1)
```

倾斜是二维变形，不能在三维空间变形。元素可能会在 _X_ 轴和 _Y_ 轴倾斜，然后转化为三维，但它们不能在 _Z_ 轴倾斜。

这里举几个 _3D_ 矩阵的例子：

_translate3d(tx,ty,tz)_ 等价于 _matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,tx,ty,tz,1)_

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20260224132918987.png)

_scale3d(sx,sy,sz)_ 等价于 _matrix3d(sx,0,0,0,0,sy,0,0,0,0,sz,0,0,0,0,1)_

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20260224132925465.png)

_rotate3d(x,y,z,a)_ 真是得搬出高中数学书好好复习一下了，第四个参数 _alpha_ 用于 _sc_ 和 _sq_ 中

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20260224132931017.png)

等价于...你自己从上到下，从左到右依次将参数搬入 _matrix3d_ 中吧。

当然除非是库函数需要，否则我严重怀疑是否会有人放着 _rotate3d_ 不用，偏要去挑战用 _matrix3d_ 模拟 _rotate3d_。

## 3. 真题解答

- 请简述一下 _CSS3_ 中新增的变形如何使用？

> 参考答案：
>
> 在 _CSS3_ 中的变形分为 _2D_ 变形和 _3D_ 变形。
>
> 整体可以划分出 _3_ 大类：
>
> - 具有 _X/Y_ 的函数：_translateX、translateY、sclaeX、scaleY、skewX、skewY_
> - _2D_ 变形函数：_translate、sclae、rotate、skew、matrix_
> - _3D_ 变形函数：_rotateX、rotateY、rotate3d、translateZ、translate3d、scaleZ、scale3d、matrix3d_
>
> 另外，还有一些重要的变形属性，例如：
>
> - **_transform_ 属性**
> - **_transform-origin_ 属性**
> - **_transform-style_ 属性**
> - **_perspective_ 属性**
> - **_perspective-origin_ 属性**
> - **_backface-visibility_ 属性**

-_EOF_-
