/**
 * 属性装饰器也是一个函数，该函数至少需要两个参数
 * 参数一： 如果是静态属性，为类本身；如果是实例属性，为类的原型
 * 参数二： 字符串，表示属性名
 */

// function d(target: any, key: any) {
//   console.log("target:" + target);
//   console.log("key:" + key);

//   console.log(target === A.prototype);
// }

// class A {
//   @d
//   prop1?: string;
//   @d
//   static prop2: string;
// }

// 2. 参数
// function d(str: string) {
//   console.log(str);
//   return function (target: any, key: any) {
//     console.log("target:" + target);
//     console.log("key:" + key);

//     console.log(target === A.prototype);
//   };
// }

// class A {
//   @d("1")
//   prop1?: string;
//   @d("2")
//   static prop2: string;
// }

// 3. 多个
// function d(str: string) {
//   console.log("d" + str);
//   return function (target: any, key: any) {
//     console.log("target+d:" + target);
//     console.log("key+d:" + key);

//     console.log(target === A.prototype);
//   };
// }

// function d2(str: string) {
//   console.log("d2" + str);
//   return function (target: any, key: any) {
//     console.log("target+d2:" + target);
//     console.log("key+d2:" + key);

//     console.log(target === A.prototype);
//   };
// }

// class A {
//   @d("1")
//   @d2("1")
//   prop1?: string;
//   @d("2")
//   static prop2: string;
// }

// 4. 将参数赋值给实列对象
function d(str: string) {
  return function (target: any, key: any) {
    // target[key] = str;

    if (!target["__initProp"]) {
      target["__initProp"] = function () {
        for (const prop in target.__props) {
          this[prop] = target.__props[prop];
        }
      };
      target.__props = {};
    }
    target.__props[key] = str;
  };
}

class A {
  @d("1")
  prop1?: string;

  constructor() {
    if (typeof this["__initProp"] === "function") {
      this["__initProp"]();
    }
  }
}

console.log(new A().prop1);
