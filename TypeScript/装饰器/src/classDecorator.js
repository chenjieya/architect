"use strict";
// 1. 基本认识
// function ClassDecoration(target: new (...args: any[]) => any) {
//   console.log("decoration");
// }
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
          ? (desc = Object.getOwnPropertyDescriptor(target, key))
          : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
Object.defineProperty(exports, "__esModule", { value: true });
function ClassDecoration(str) {
  console.log("我先执行，然后返回真正的装饰器，最后在交给反射，去执行装饰器");
  // 真正的装饰器
  return function (target) {
    console.log("真正的装饰器" + str);
  };
}
let A = class A {
  name;
  age;
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
  info() {}
};
A = __decorate([ClassDecoration("nihao")], A);
