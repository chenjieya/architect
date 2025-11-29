// 1. 基本认识
// function ClassDecoration(target: new (...args: any[]) => any) {
//   console.log("decoration");
// }

// @ClassDecoration
// class A {}

// 2. 参数
// type Constrocuter<T = any> = new (...args: any[]) => T;

// type User = {
//   name: string;
//   age: number;
//   info: () => any;
// };

// function ClassDecoration<T extends Constrocuter<User>>(str: string) {
//   console.log("我先执行，然后返回真正的装饰器，最后在交给反射，去执行装饰器");

//   // 真正的装饰器
//   return function (target: T) {
//     console.log("真正的装饰器" + str);
//   };
// }

// @ClassDecoration("nihao")
// class A {
//   constructor(public name: string, public age: number) {}
//   info() {}
// }

// 3. 装饰器也可以是类
// type Constrocuter<T = any> = new (...args: any[]) => T;

// type User = {
//   name: string;
//   age: number;
//   info: () => any;
// };

// function ClassDecoration<T extends Constrocuter<User>>(target: T) {
//   // 真正的装饰器
//   return class extends target {
//     name: string = "你好，覆盖";
//   };
// }

// @ClassDecoration
// class A {
//   name = "你好";
//   constructor(public age: number) {}
//   info() {}
// }

// console.log(new A(18).name);

// 4. 多个装饰器，注意执行顺序(函数正常执行，装饰器顺序倒着执行)
type Constrocuter<T = any> = new (...args: any[]) => T;

type User = {
  name: string;
  age: number;
  info: () => any;
};

function ClassDecoration1<T extends Constrocuter<User>>(str: string) {
  console.log("ClassDecoration1函数：" + str);

  // 真正的装饰器
  return function (target: T) {
    console.log("真正的装饰器ClassDecoration1：" + str);
  };
}

function ClassDecoration2<T extends Constrocuter<User>>(str: string) {
  console.log("ClassDecoration2函数：" + str);

  // 真正的装饰器
  return function (target: T) {
    console.log("真正的装饰器ClassDecoration2：" + str);
  };
}

@ClassDecoration1("1")
@ClassDecoration2("2")
class A {
  constructor(public name: string, public age: number) {}
  info() {}
}
