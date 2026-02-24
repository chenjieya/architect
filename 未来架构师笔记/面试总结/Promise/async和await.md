![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20260224134753171.png)

## 1. 消除回调

有了Promise，异步任务就有了一种统一的处理方式

有了统一的处理方式，ES官方就可以对其进一步优化

ES7推出了两个关键字`async`和`await`，用于更加优雅的表达Promise

### 1.1 async

async关键字用于修饰函数，被它修饰的函数，一定返回Promise

```js
async function method1() {
  return 1 // 该函数的返回值是Promise完成后的数据
}

method1() // Promise { 1 }

async function method2() {
  return Promise.resolve(1) // 若返回的是Promise，则method得到的Promise状态和其一致
}

method2() // Promise { 1 }

async function method3() {
  throw new Error(1) // 若执行过程报错，则任务是rejected
}

method3() // Promise { <rejected> Error(1) }
```

### 1.2 await

`await`关键字表示等待某个Promise完成，**它必须用于`async`函数中**

```js
async function method() {
  const n = await Promise.resolve(1)
  console.log(n) // 1
}

// 上面的函数等同于
function method() {
  return new Promise((resolve, reject) => {
    Promise.resolve(1).then((n) => {
      console.log(n)
      resolve(1)
    })
  })
}
```

`await`也可以等待其他数据

```js
async function method() {
  const n = await 1 // 等同于 await Promise.resolve(1)
}
```

如果需要针对失败的任务进行处理，可以使用`try-catch`语法

```js
async function method() {
  try {
    const n = await Promise.reject(123) // 这句代码将抛出异常
    console.log('成功', n)
  } catch (err) {
    console.log('失败', err)
  }
}

method() // 输出： 失败 123
```

## 2. 邓哥表白的完美解决方案

邓哥的女神可不是只有4位，而是40位！

为了更加方便的编写表白代码，邓哥决定把这40位女神放到一个数组中，然后利用async和await轻松完成代码

```js
// 女神的名字数组
const beautyGirls = [
  '梁平',
  '邱杰',
  '王超',
  '冯秀兰',
  '赖军',
  '顾强',
  '戴敏',
  '吕涛',
  '冯静',
  '蔡明',
  '廖磊',
  '冯洋',
  '韩杰',
  '江涛',
  '文艳',
  '杜秀英',
  '丁艳',
  '邓静',
  '江刚',
  '乔刚',
  '史平',
  '康娜',
  '袁磊',
  '龙秀英',
  '姚静',
  '潘娜',
  '萧磊',
  '邵勇',
  '李芳',
  '谭芳',
  '夏秀英',
  '程娜',
  '武杰',
  '崔军',
  '廖勇',
  '崔强',
  '康秀英',
  '余磊',
  '邵勇',
  '贺涛',
]

// 向某位女生发送一则表白短信
// name: 女神的姓名
function sendMessage(name) {
  return new Promise((resolve, reject) => {
    // 模拟 发送表白短信
    console.log(
      `邓哥 -> ${name}：最近有谣言说我喜欢你，我要澄清一下，那不是谣言😘`,
    )
    console.log(`等待${name}回复......`)
    // 模拟 女神回复需要一段时间
    setTimeout(() => {
      // 模拟 有10%的几率成功
      if (Math.random() <= 0.1) {
        // 成功，调用 onFuffiled，并传递女神的回复
        resolve(`${name} -> 邓哥：我是九，你是三，除了你还是你😘`)
      } else {
        // 失败，调用 onRejected，并传递女神的回复
        reject(`${name} -> 邓哥：你是个好人😜`)
      }
    }, 1000)
  })
}

// 批量表白的程序
async function proposal() {
  let isSuccess = false
  for (const girl of beautyGirls) {
    try {
      const reply = await sendMessage(girl)
      console.log(reply)
      console.log('表白成功!')
      isSuccess = true
      break
    } catch (reply) {
      console.log(reply)
      console.log('表白失败')
    }
  }
  if (!isSuccess) {
    console.log('邓哥注定孤独一生')
  }
}
proposal()
```
