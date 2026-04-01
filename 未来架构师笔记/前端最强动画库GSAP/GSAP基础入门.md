## 1. 概述

GSAP（GreenSock Animation Platform）是一个功能强大且高性能的 JavaScript 动画库，专门用于创建流畅、复杂和跨浏览器兼容的网页动画。GSAP 广泛应用于网页动画、交互动效、SVG 动画、Canvas 动画等场景，是目前最受欢迎的前端动画库之一。

官网地址：[https://gsap.com/](https://gsap.com/)

## 2. 动画方法

```javascript
// 从起点到设定的位置
gsap.to()
// 从那个位置，回到0这个起点
gsap.from()
// 从第一个配置对象的位置到另一个对象的位置
gsap.fromTo()
// 移动到指定位置，没有动画效果
gsap.set()
```

## 3. 动画配置项

```javascript
gsap.to('.selector', {
  // selector text, Array, or object
  x: 100, // any properties (not limited to CSS)
  backgroundColor: 'red', // camelCase
  duration: 1, // seconds
  delay: 0.5,
  ease: 'power2.inOut', // 运动形式  none就是缓动
  stagger: 0.1, // 交错开始执行动画（0.1是时间）支持对象，可以针对每一个repeat重复，repeat写外面是整体的repeat
  paused: true, // 暂停
  overwrite: 'auto', // default is false
  repeat: 2, // 动画重复执行次数（默认执行一次，然后在重复两次）（-1表示无限重复）
  repeatDelay: 1, // seconds between repeats
  repeatRefresh: true, // invalidates on each repeat
  yoyo: true, // 一个来回，反向repeat if true > A-B-B-A, if false > A-B-A-B
  yoyoEase: true, // 运动形式和正向一样，来的时候减速，回去的时候也是减速的
  immediateRender: false,
  onComplete: () => {
    console.log('finished')
  },
  // other callbacks:
  // onStart, onUpdate, onRepeat, onReverseComplete
})
```

## 4. 控制方法

```javascript
// retain animation reference to control later
let anim = gsap.to(...); // or gsap.timeline(...);
// most methods can be used as getters or setters
anim.play() // plays forward
  .pause()
  .resume() // 继续播放（会沿着当前的方向继续播放， play永远都是正向的播放）
  .reverse()  // 反向播放
  .restart()
  .timeScale(2) // 2 = double speed, 0.5 = half speed
  .seek(1.5) // jump to a time (in seconds) or label
  .progress(0.5) // jump to halfway
  .totalProgress(0.8) // includes repeats
  // when used as setter, returns animation (chaining)

  // other useful methods (tween and timeline)
  .kill() // immediately destroy
  .isActive() // true 会持续输出动画是否结束
  .then() // Promise
  .invalidate() // clear recorded start/end values
  .eventCallback() // get/set an event callback

  // timeline-specific methods
  // add label, tween, timeline, or callback
  .add(thing, position)
  // calls function at given point
  .call(func, params, position)
  // get an Array of the timeline's children
  .getChildren()
  // empties the timeline
  .clear()
  // animate playhead to a position linearly
  .tweenTo(timeOrLabel, {vars})
  // ^^ with both start and end positions
  .tweenFromTo(from, to, {vars})
```

## 5. 实用工具方法

```javascript
checkPrefix() // get relevant browser prefix for property
clamp() // 限制值的范围
distribute() // distribute value among and array
getUnit() // get unit of string
interpolate() // interpolate between values
mapRange() // map one range to another
normalize() // map a range to the 0-1 range
pipe() // 管道，函数组合
random() // generates a random value
selector() // get a scoped selector function
shuffle() // shuffles an array in-place
snap() // snap a value to either increment or array
splitColor() // splits color into RGB array
toArray() // convert array-like thing to array
unitize() // adds specified unit to function results
wrap() // place number in range, wrapping to start
wrapYoyo() // place number in range, wrapping in reverse
```

## 6. 缓动配置项

```javascript
// see greensock.com/ease-visualizer
ease: 'none' //匀速 (same as "linear")

// basic core eases
;('power1', 'power2', 'power3', 'power4', 'circ', 'expo', 'sine')
// each has .in, .out, and .inOut extensions
// i.e. "power1.inOut"

// expressive core eases
;('elastic', 'back', 'bounce', 'steps(n)')

// in EasePack plugin (not core)
;('rough', 'slow', 'expoScale(1, 2)')

//expressive plugin eases
;(CustomEase, CustomWiggle, CustomBounce)
```

## 7. 钩子函数

```javascript
gsap.to(".selector", {
  onStart() {},
  onStartParams: [],
  onComplete() {},
  onCompleteParams: [],
  onUpdate() {}
  ...
})
```

## 8. 动画默认值与非动画配置项

```javascript
// Set GSAP's global tween defaults
gsap.defaults({ ease: 'power2.in', duration: 1 })

// Configure GSAP's non-tween-related settings
gsap.config({
  autoSleep: 60,
  force3D: false,
  nullTargetWarn: false,
  trialWarn: false,
  units: { left: '%', top: '%', rotation: 'rad' },
})
```

## 9. 创建时间线

```javascript
// Create a timeline
let tl = gsap.timeline({
  delay: 0.5,
  paused: true, // default is false
  repeat: 2, // number of repeats (-1 for infinite)
  repeatDelay: 1, // seconds between repeats
  repeatRefresh: true, // invalidates on each repeat
  yoyo: true, // if true > A-B-B-A, if false > A-B-A-B
  defaults: {
    // children inherit these defaults
    duration: 1,
    ease: 'none',
  },
  smoothChildTiming: true,
  autoRemoveChildren: true,
  onComplete: () => {
    console.log('finished')
  },
  // other callbacks:
  // onStart, onUpdate, onRepeat, onReverseComplete
})

// Sequence multiple tweens
tl.to('.selector', { duration: 1, x: 50, y: 0 })
  .to('#id', { autoAlpha: 0 })
  .to(elem, { duration: 1, backgroundColor: 'red' })
  .to([elem, elem2], { duration: 3, x: 100 })
```

## 10. 时间线位置参数

```javascript
// position parameter (controls placement)
tl.to(target, { toVars }, positionParameter)

0.7 // exactly 0.7 seconds into the timeline (absolute)
;('-=0.7') // overlap with previous by 0.7 sec
;('myLabel') // insert at "myLabel" position
;('myLabel+=0.2') // 0.2 seconds after "myLabel"
;('<') // align with start of most recently-added child
;('<0.2') // 0.2 seconds after ^^
;('-=50%') // overlap half of inserting animation's duration
;('<25%') // 25% into the previous animation (from its start)
```

## 11. 对象属性变化

```javascript
const counter = {
  value: 0,
}
gsap.to(counter, {
  value: 100,
  duration: 5,
  snap: { value: 5 },
  onUpdate() {
    console.log(counter.value)
  },
})
```

## 12. Media响应式

```javascript
// create
let mm = gsap.matchMedia();

// add a media query. When it matches, the associated function will run
mm.add("(min-width: 800px)", () => {

  // this setup code only runs when viewport is at least 800px wide
  gsap.to(...);
  gsap.from(...);
  ScrollTrigger.create({...});

  return () => { // optional
    // custom cleanup code here (runs when it STOPS matching)
  };
});

// later, if we need to revert all the animations/ScrollTriggers...
mm.revert();
```

## 13. Stagger高级配置

```javascript
gsap.to('.box', {
  x: 500,
  stagger: {
    amount: 1,
    from: 'center',
    grid: [4, 3],
    axis: 'x',
  },
})
```
