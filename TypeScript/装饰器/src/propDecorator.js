"use strict";
/**
 * 属性装饰器也是一个函数，该函数至少需要两个参数
 * 参数一： 如果是静态属性，为类本身；如果是实例属性，为类的原型
 * 参数二： 字符串，表示属性名
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
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
function d(str) {
    return function (target, key) {
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
    prop1;
    constructor() {
        if (typeof this["__initProp"] === "function") {
            this["__initProp"]();
        }
    }
}
__decorate([
    d("1"),
    __metadata("design:type", String)
], A.prototype, "prop1", void 0);
console.log(new A().prop1);
