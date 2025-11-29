/**
 * 方法装饰器也是一个函数，该函数至少需要三个参数

	参数一： 如果是静态方法，为类本身*(类构造函数类型)*；如果是实例方法，为类的原型*(对象类型)*

	参数二： 字符串，表示方法名

	参数三： 属性描述对象，*其实就是js的Object.defineProperty()中的属性描述对象{value:xxx,writable:xxx, enumerable:xxx, configurable:xxx}
 */

// 1. 方法装饰器

// function d1(
//   target: new (...args: any[]) => any,
//   key: string,
//   desc: PropertyDescriptor
// ) {
//   console.log("静态方法装饰器开始执行了");
//   console.log(target);
//   console.log(key);
//   console.log(desc);
//   console.log("-----------------------");
// }

// function d2(
//   target: Record<string, any>,
//   key: string,
//   desc: PropertyDescriptor
// ) {
//   console.log("方法装饰器开始执行了");
//   console.log(target);
//   console.log(key);
//   console.log(desc);
//   console.log("-----------------------");
// }

// class A {
//   @d1
//   static fun1() {}
//   @d2
//   fun2() {}
// }

// 2. 可枚举该方法装饰器
// function enumerable(
//   target: Record<string, any>,
//   key: string,
//   desc: PropertyDescriptor
// ) {
//   desc.enumerable = true;
// }

// class A {
//   @enumerable
//   func() {}
// }

// for (const key in new A()) {
//   console.log(key);
// }

// 3. 将该方法标记为过期方法
// function noUse(str: string) {
//   return function (
//     target: Record<string, any>,
//     key: string,
//     desc: PropertyDescriptor
//   ) {
//     console.log("该方法已经过期了，我将使用新的方法进行替换");
//     desc.value = function (...args: any[]) {
//       console.log(...args, str);
//     };
//   };
// }

// class A {
//   @noUse("过期了")
//   func(a, b, c) {
//     console.log("this is my Function");
//   }
// }

// const obj = new A();
// obj.func(1, 2, 3);

// 4. 方法拦截器
function enumerable(
  target: Record<string, any>,
  key: string,
  desc: PropertyDescriptor
) {
  desc.enumerable = true;
}

function interceptor(str: string) {
  return function (
    target: Record<string, any>,
    key: string,
    desc: PropertyDescriptor
  ) {
    // 保留最原始的函数
    const temp = desc.value;

    desc.value = function (...args: any[]) {
      console.log("before 函数执行之前操作的事情" + str);

      temp.call(this, ...args);

      console.log("after 函数执行之后操作的事情" + str);
    };
  };
}

class A {
  @enumerable
  @interceptor("拦截器～")
  func() {
    console.log("正常函数");
  }
}

for (const key in new A()) {
  console.log(key);
}

const obj = new A();
obj.func();
