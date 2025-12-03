"use strict";
// 1. 基本认识
// function ClassDecoration(target: new (...args: any[]) => any) {
//   console.log("decoration");
// }
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
function ClassDecoration1(str) {
    console.log("ClassDecoration1函数：" + str);
    // 真正的装饰器
    return function (target) {
        console.log("真正的装饰器ClassDecoration1：" + str);
    };
}
function ClassDecoration2(str) {
    console.log("ClassDecoration2函数：" + str);
    // 真正的装饰器
    return function (target) {
        console.log("真正的装饰器ClassDecoration2：" + str);
    };
}
let A = class A {
    name;
    age;
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }
    info() { }
};
A = __decorate([
    ClassDecoration1("1"),
    ClassDecoration2("2"),
    __metadata("design:paramtypes", [String, Number])
], A);
