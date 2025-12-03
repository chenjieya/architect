"use strict";
/**
 * 访问器属性装饰器
    参数一： 类的原型(对象类型)
    参数二： 字符串，表示方法名
    参数三： 属性描述对象，其实就是js的Object.defineProperty()中的属性描述对象{set:Function,get:Function, enumerable:xxx, configurable:xxx}
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
function d(str) {
    return function (target, key, desc) {
        const temp = desc.set;
        desc.set = function (value) {
            console.log("前置", str);
            temp.call(this, value);
            console.log("后置", str);
        };
    };
}
class A {
    age = 10;
    set _age(v) {
        this.age = v;
        console.log(this.age, "age");
    }
    get _age() {
        return this.age;
    }
}
__decorate([
    d("set"),
    __metadata("design:type", Number),
    __metadata("design:paramtypes", [Number])
], A.prototype, "_age", null);
const obj = new A();
obj._age = 18;
