const { reactive } = require('@alvis/reactivity')
const obj1 = {
  a: 1,
  b: 2,
}

const obj2 = '123'

// 简单见识一下依赖收集和触发更新
// const test1 = reactive(obj1)
// console.log(test1.a)
// test1.b = 123

// 传递的参数不是对象，则原封不动的返回
// const test2 = reactive(obj2)
// console.log(test2)

// 代理的是同一个对象，则应该保持地址不变
// const test3 = reactive(obj1)
// const test4 = reactive(obj1)
// console.log(test4 === test3)

// 检查参数是否是响应式对象
// const test5 = reactive(obj1)
// const test6 = reactive(test5)

// console.log(test5 === test6)

// 访问器属性问题
const obj3 = {
  firstName: 'chen',
  lastName: 'jie',
  get fullName() {
    return this.firstName + this.lastName
  },
  set changeName(name) {
    this.firstName = name.val1
    this.lastName = name.val2
  },
}
const test7 = reactive(obj3)
// 正常来说应该是访问三次，因为fullName里面还有两次访问了，里面的两个属性应该也被依赖收集
console.log(test7.fullName)

test7.changeName = { val1: 'ac', val2: 'lajsd' }
console.log(test7.fullName)
