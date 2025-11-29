/**
 * 访问器属性装饰器
 	参数一： 类的原型(对象类型)
	参数二： 字符串，表示方法名
	参数三： 属性描述对象，其实就是js的Object.defineProperty()中的属性描述对象{set:Function,get:Function, enumerable:xxx, configurable:xxx}
 */

function d(str: string) {
  return function <T>(
    target: Record<string, any>,
    key: string,
    desc: TypedPropertyDescriptor<T>
  ) {
    const temp = desc.set!;
    desc.set = function (value: T) {
      console.log("前置", str);
      temp.call(this, value);
      console.log("后置", str);
    };
  };
}

class A {
  private age: number = 10;

  @d("set")
  set _age(v: number) {
    this.age = v;
    console.log(this.age, "age");
  }

  get _age() {
    return this.age;
  }
}

const obj = new A();

obj._age = 18;
