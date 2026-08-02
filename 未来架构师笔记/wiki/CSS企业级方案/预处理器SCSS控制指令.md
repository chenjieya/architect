---
author: human
ai_editable: false
updated_by: human
updated: 2026-08-02
---

## 1. 三元运算符

```base
if(expression, value1, value2)
```

示例如下：

```scss
p {
  color: if(1+1==2, green, yellow);
}

div {
  color: if(1+1==3, green, yellow);
}
```

```css
p {
  color: green;
}

div {
  color: yellow;
}
```



## 2. @if 分支

这个表示是分支。分支又分为三种：

- 单分支
- 双分支
- 多分支



### 2.1 单分支

```scss
p {
  @if 1+1 == 2 {
    color: red;
  }
  margin: 10px;
}

div {
  @if 1+1 == 3 {
    color: red;
  }
  margin: 10px;
}
```

```css
p {
  color: red;
  margin: 10px;
}

div {
  margin: 10px;
}
```



### 2.2 双分支

仍然使用的是 @else

```scss
p {
  @if 1+1 == 2 {
    color: red;
  } @else {
    color: blue;
  }
  margin: 10px;
}

div {
  @if 1+1 == 3 {
    color: red;
  } @else {
    color: blue;
  }
  margin: 10px;
}
```

```css
p {
  color: red;
  margin: 10px;
}

div {
  color: blue;
  margin: 10px;
}
```



### 2.3 多分支

使用 @else if 来写多分支

```scss
$type: monster;
p {
  @if $type == ocean {
    color: blue;
  } @else if $type == matador {
    color: red;
  } @else if $type == monster {
    color: green;
  } @else {
    color: black;
  }
}
```

```css
p {
  color: green;
}
```



## 3. @for循环

语法如下：

```base
@for $var from <start> through <end> # 会包含 end 结束值
// 或者
@for $var from <start> to <end> # to 不会包含 end 结束值
```

```scss
@for $i from 1 to 3{
  .item-#{$i} {
    width: $i * 2em;
  }
}

@for $i from 1 through 3{
  .item2-#{$i} {
    width: $i * 2em;
  }
}
```

```css
.item-1 {
  width: 2em;
}

.item-2 {
  width: 4em;
}

.item2-1 {
  width: 2em;
}

.item2-2 {
  width: 4em;
}

.item2-3 {
  width: 6em;
}
```



## 4. @while循环

语法如下：

```base
@while expression
```

```scss
$i: 6;
@while $i > 0 {
  .item-#{$i} {
    width: 2em * $i;
  }
  $i: $i - 2;
}

```

```css
.item-6 {
  width: 12em;
}

.item-4 {
  width: 8em;
}

.item-2 {
  width: 4em;
}
```

注意，一定要要在 while 里面书写改变变量的表达式，否则就会形成一个死循环。



## 5. @each循环

这个优有点类似于 JS 里面的 for...of 循环，会把数组或者字典类型的每一项值挨着挨着取出来

```scss
@each $var in $vars
```

$var可以是任意的变量名，但是 $vars 只能是 list 或者 maps

下面是一个遍历列表（数组）

```scss
$arr:puma, sea-slug, egret, salamander;

@each $animal in $arr{
  .#{$animal}-icon{
    background-image: url("/images/#{$animal}.png")
  }
}
```

```css
.puma-icon {
  background-image: url("/images/puma.png");
}

.sea-slug-icon {
  background-image: url("/images/sea-slug.png");
}

.egret-icon {
  background-image: url("/images/egret.png");
}

.salamander-icon {
  background-image: url("/images/salamander.png");
}
```

下面是一个遍历字典类型的示例：

```scss
$dict: (
  h1: 2em,
  h2: 1.5em,
  h3: 1.2em,
  h4: 1em,
);

@each $header, $size in $dict {
  #{$header}{
    font-size: $size;
  }
}
```

```css
h1 {
  font-size: 2em;
}

h2 {
  font-size: 1.5em;
}

h3 {
  font-size: 1.2em;
}

h4 {
  font-size: 1em;
}
```


