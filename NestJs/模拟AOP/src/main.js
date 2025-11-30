"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
// 装饰器，在正常函数执行之前执行的函数
function Before(fn) {
    // 返回真正的装饰器
    return function (target, key, desc) {
        const temp = desc.value; // 缓存最原始的函数
        desc.value = function (...args) {
            fn.call(this, ...args); // 先执行传入的函数
            return temp.call(this, ...args); // 再执行最原始的函数
        };
    };
}
class Test {
    greet(name) {
        console.log(`正常函数内部执行：Hello, ${name}!`);
        return `Hello, ${name}!`;
    }
}
__decorate([
    Before(function (name) {
        console.log(`Before method execution: preparing to greet ${name}`);
    })
], Test.prototype, "greet", null);
const obj = new Test();
const res = obj.greet("World");
console.log(`函数返回值打印：${res}`);
