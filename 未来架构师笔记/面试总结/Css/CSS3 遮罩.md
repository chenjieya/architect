本文主要包含以下内容：

- _CSS3_ 遮罩介绍
- 遮罩各属性介绍

## 1. _CSS3_ 遮罩介绍

_CSS mask_ 遮罩属性的历史非常久远了，远到比 _CSS3 border-radius_ 等属性还要久远，最早是出现在 _Safari_ 浏览器上的，差不多可以追溯到 _2009_ 年。

不过那个时候，遮罩只能作为实验性的属性，做一些特效使用。毕竟那个年代还是 _IE_ 浏览器的时代，属性虽好，但价值有限。

但是如今情况却大有变化，除了 _IE_ 浏览器不支持，_Firefox、Chrome、Edge_ 以及移动端等都已经全线支持，其实际应用价值已不可同日而语。

尤其 _Firefox_ 浏览器，从版本 _53_ 开始，已经全面支持了 _CSS3 mask_ 属性。并且 _mask_ 属性规范已经进入候选推荐规范之列，会说以后进入既定规范标准已经是板上钉钉的事情，大家可以放心学习，将来必有用处。

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20260224133144376.png)

（图为 _caniuse_ 上各浏览器对 _CSS mask_ 的支持情况）

## 2. 快速入门示例

下面，我们来看一个 _CSS mask_ 的快速入门示例。

首先需要准备两张图片，图片素材如下：

一张 _jpg_ 图片：_zelda.jpg_

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20260224133159807.png)

一张 _png_ 图片：_mask.png_，该 _png_ 图片背景为透明（这里划重点）

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20260224133208849.png)

接下来准备我们的测试目录：

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20260224133217992.png)

_index.html_ 代码如下：

```html
<div class="mask"></div>
```

```css
* {
  margin: 0;
  padding: 0;
}

div {
  width: 1200px;
  height: 600px;
  outline: 1px solid;
  margin: 50px auto;
  background: url('./zelda.jpg') no-repeat center/cover;
}

/*  
  虽然 .mask 和 div 都是选择中的相同的元素
  这里为了单独观察 mask 相关设置，
  和 mask 不相关的属性设置放入到了 div 选择器中 
*/
.mask {
  -webkit-mask-image: url('./mask.png');
}
```

在上面的代码中，我们为 _div_ 设置了一个铺满整个盒子的背景图，然后为该盒子设置了遮罩效果。由于 _mask.png_ 无法占满整个盒子，所以出现了重复的效果，**_mask.png_ 遮罩图片透明的部分不会显示底部图片的信息，而非透明部分则会显示底层图片信息**。

效果如下：

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20260224133239188.png)

除了设置透明的 _png_ 图片，还可以设置透明的渐变。例如：

```css
.mask {
  -webkit-mask-image: linear-gradient(transparent 10%, white);
}
```

在上面的代码中，我们设置了一个从上到下的线性透明渐变，效果如下：

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20260224133246946.png)

可以看到，无论是设置图片还是渐变，一定要有透明的部分，否则无法起到遮罩的效果，例如：

```css
.mask {
  -webkit-mask-image: linear-gradient(red, blue);
}
```

上面的代码中，我们设置的是一个红到蓝的渐变，没有任何的透明部分，所以遮罩层不会起作用，底图会原封不动的显示出来。

## 3. 遮罩各属性介绍

在上面的快速入门示例中，我们用到的是 _mask-image_ 属性，但是除了该属性外，_CSS mask_ 还有很多其他的属性，如下：

- _mask-image_
- _mask-mode_
- _mask-repeat_
- _mask-position_
- _mask-clip_
- _mask-origin_
- _mask-size_
- _mask-type_
- _mask-composite_

下面我们来针对每个属性进行介绍。

### 3.1 _mask-image_

该属性在上面的快速入门示例中我们已经体验过了，默认值为 _none_，表示没有遮罩图片。

可以设置的值为透明图片，或透明渐变。

### 3.2 _mask-repeat_

表示遮罩层是否允许重复，默认值为 _repeat_ 允许重复，可选值与 _background-repeat_ 相同。

```css
.mask {
  -webkit-mask-image: url('./mask.png');
  -webkit-mask-repeat: no-repeat;
}
```

上面的代码中，我们设置遮罩层的重复行为是 _x、y_ 轴都不重复，效果如下：

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20260224133500955.png)

（红框是为了表示整张图片的大小，并非浏览器实际显示情况）

### 3.3 _mask-position_

该属性用于设置遮罩层的位置，默认值为*0 0* 在最左上角，可选值与 _background-position_ 相同。

```css
.mask {
  -webkit-mask-image: url('./mask.png');
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
}
```

效果如下：

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20260224133508054.png)

（红框是为了表示整张图片的大小，并非浏览器实际显示情况）

### 3.4 _mask-size_

该属性用于设置遮罩层的大小，默认值为 _auto_，可选值与 _background-size_ 相同，如下表：

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20260224133534283.png)

例如：

```css
.mask {
  -webkit-mask-image: url('./mask.png');
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
  -webkit-mask-size: contain;
}
```

效果如下：

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20260224133542298.png)

（红框是为了表示整张图片的大小，并非浏览器实际显示情况）

### 3.5 _mask-origin_

默认值为 _border-box_，可选值与 _background-origin_ 相同，可以设置如下的属性值：

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20260224133600366.png)

下面为了显示其效果，我们需要稍微对其他样式做一些改变，如下：

```css
div {
  width: 1200px;
  height: 600px;
  border: 100px solid;
  margin: 50px auto;
  background: url('./zelda.jpg') no-repeat center/cover;
}

/*  
虽然 .mask 和 div 都是选择中的相同的元素
这里为了单独观察 mask 相关设置，
和 mask 不相关的属性设置放入到了 div 选择器中 
*/
.mask {
  -webkit-mask-image: url('./mask.png');
  -webkit-mask-repeat: no-repeat;
}
```

在上面的代码中，我们为该 _div_ 设置了一个宽度为 _100px_ 的 _border_，由于 _mask-origin_ 的默认值为 _border-box_，所以我们可以看到如下的效果：

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20260224133610094.png)

（红框是为了表示整张图片的大小，并非浏览器实际显示情况）

此时如果设置 _mask-origin_ 的值为 _centent-box_，遮罩层图像就会相对于内容框来定位。

```css
.mask {
  -webkit-mask-image: url('./mask.png');
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-origin: content-box;
}
```

效果如下：

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20260224133623752.png)

（外层的黑框表示该 _div_ 的 _border_，红框表示该 _div_ 的内容区域，并非浏览器实际显示情况）

### 3.6 _mask-clip_

默认值为 _border-box_，可选值与 _background-clip_ 相同，可以设置如下属性值：

<img src="https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2021-10-26-025300.png" alt="image-20211026105259969" style="zoom:50%;" />

我们同样为 _div_ 设置一个宽度为 _100px_ 的 _border_，由于默认值为 _border-box_，所以我们看到的效果如下：

![image-20211026100927087](https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2021-10-26-025412.png)

（红框是为了表示整张图片的大小，并非浏览器实际显示情况）

接下来设置 _mask-clip_ 为 _content-box_

```css
.mask {
  -webkit-mask-image: url('./mask.png');
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-clip: content-box;
}
```

由于 _mask-origin_ 默认值为 _border-box_，所以遮罩层以边框盒来定位，之后我们设置了 _mask-clip_ 为 _content-box_，表示以内容框来进行裁剪。效果如下：

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20260224133637743.png)

（外层的黑框表示该 _div_ 的 _border_，红框表示该 _div_ 的内容区域，并非浏览器实际显示情况）

### 3.7 _mask-mode_

_mask-mode_ 属性默认值为 _match-source_，作用是根据资源的类型自动采用合适的遮罩模式。

例如，如果遮罩效果使用的是 _SVG_ 中的 \<_mask_> 元素，则此时的 _mask-mode_ 属性的值为 _luminance_，表示基于亮度来判断是否要进行遮罩。

如果是其他场景，则计算值是 _alpha_，表示基于透明度判断是否要进行遮罩。

因此 _mask-mode_ 可选值为 _alpha、luminance、match-source_。

使用搜索引擎搜索遮罩素材的时候，往往搜索的结果都是白底的 _JPG_ 图片，因此使用默认的遮罩模式是没有预期的遮罩效果的。此时就非常适合设置遮罩模式为 _luminance_。

另外，目前仅 _Firefox_ 浏览器支持 _mask-mode_ 属性，_Chrome_ 浏览器并不提供支持，但是可以使用非标准的 _mask-source-type_ 属性来进行替代（没有私有前缀）。

下面来看一个简单的示例。首先我们需要扩充我们的遮罩素材，准备了一张 _mask2.jpg_ 的遮罩图片，该素材首先是 _jpg_ 格式的，其次并没有透明区域，仅有一些白底区域。

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20260224133653184.png)

接下来设置如下的代码：

```css
.mask {
  -webkit-mask-image: url('./mask2.jpg');
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-mode: luminance;
}
```

在上面的代码中，我们设置 _mask-mode_ 的值为 _luminance_，表示基于亮度来判断是否进行遮罩。

在 _Firefox_ 浏览器中的效果如下：

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20260224133659959.png)

（红框是为了表示整张图片的大小，并非浏览器实际显示情况）

### 3.8 _mask-type_

_mask-type_ 属性的功能和 _mask-mode_ 属性类似，都是设置不同的遮罩模式，但还是有一个很大的区别，就是 _mask-type_ 属性只能作用于 _SVG_ 元素上，因为其本质上是由 _SVG_ 属性演变而来的，_Chrome_ 等浏览器也都支持该属性。而 _mask-mode_ 是一个针对所有元素类型的 _CSS_ 属性，_Chrome_ 等浏览器并不支持该属性，目前仅只有 _Firefox_ 浏览器对其提供支持。

由于 _mask-type_ 属性只能作用于 _SVG_ 元素上，因此默认值表现为 _SVG_ 元素默认遮罩模式，也就是默认值是 _luminance_ 亮度遮罩模式。如果需要支持透明度遮罩模式，可以这么设置：

```css
mask-type: alpha;
```

### 3.9 _mask-composite_

_mask-composite_ 属性表示同时使用多张图片进行遮罩时的合成方式。默认值为 _add_，可选值为 _add、subtract、intersect、exclude_。

- _mask-composite: add_：表示遮罩累加，这是默认值
- _mask-composite: subtract_：表示遮罩相减，也就是遮罩图片重合的区域不显示，这就意味着，遮罩层图片越多，遮罩区域越小。
- _mask-composite: intersect_：表示遮罩相交，也就是遮罩图片重合的区域才显示遮罩。
- _mask-composite: exclude_：表示遮罩排除，也就是遮罩图片重合的区域会被当作透明。

-_EOF_-
