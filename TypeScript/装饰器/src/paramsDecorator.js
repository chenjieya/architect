"use strict";
/**
 * 方法参数几乎和属性装饰器一致，只是多了一个属性
 **参数一：** 如果是静态属性，为类本身；如果是实例属性，为类的原型
 **参数二：** 字符串，表示方法名
 **参数三：** 表示参数顺序
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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
function paramDecortor(paramsName) {
    return function (target, key, index) {
        // 如果不存在，则进行初始化
        !target.__params && (target.__params = {});
        target.__params[index] = paramsName;
    };
}
class A {
    method1(id, name) {
        console.log("正常方法内的执行：", id, name);
    }
}
__decorate([
    __param(0, paramDecortor("id")),
    __param(1, paramDecortor("name")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", void 0)
], A.prototype, "method1", null);
const obj = new A();
obj.method1(1, "alvis");
// 打印原型看一眼（索引0对应第一个参数，一次类推）
console.log(A.prototype);
