import "reflect-metadata";

// 定义元数据
// 声明式
// @Reflect.metadata(metadataKey, metadataValue)
// 命令式
// Reflect.defineMetadata(metadataKey, metadataValue, 定义元数据的对象, propertyKey?)

// 获取元数据
// Reflect.getMetadata(metadataKey, 定义元数据类, proppertyKey?):返回metadataValue

// 1.
// @Reflect.metadata("test", "声明式定义1")
// class A {
//   prop1: string = "1";
//   method() {}
// }

// const val = Reflect.getMetadata("test", A);
// console.log(val);

// 2.

// class A {
//   prop1: string = "1";
//   method() {}
// }

// Reflect.defineMetadata("test", "命令式定义1", A);

// const val = Reflect.getMetadata("test", A);
// console.log(val);

// 3. 工厂式
// const ClassTypeMetaKey = Symbol("classType");
// function ClassType(type: string) {
//   return Reflect.metadata(ClassTypeMetaKey, type);
// }

// @ClassType("声明式定义")
// class A {
//   prop1: string = "1";
//   method() {}
// }

// const val = Reflect.getMetadata(ClassTypeMetaKey, A);
// console.log(val);

// 4.
// type constructor<T = any> = new (...args: any[]) => T;
// const ClassTypeMetaKey = Symbol("classType");
// function ClassType(type: string) {
//   return function <T extends constructor>(target: T) {
//     Reflect.defineMetadata(ClassTypeMetaKey, type, target);
//   };
// }

// @ClassType("命令式定义")
// class A {
//   prop1: string = "1";
//   method() {}
// }

// const val = Reflect.getMetadata(ClassTypeMetaKey, A);
// console.log(val);

// 5. 成员属性和方法
// class A {
//   @Reflect.metadata("propType1", "prop1-value")
//   prop1: string = "1";
//   @Reflect.metadata("propType2", "prop2-value")
//   static prop2: string;

//   @Reflect.metadata("methodType1", "method1-value")
//   method1() {}

//   @Reflect.metadata("methodType2", "method2-value")
//   static method2() {}
// }

// console.log(Reflect.getMetadata("propType1", A.prototype, "prop1"));
// console.log(Reflect.getMetadata("methodType1", A.prototype, "method1"));

// console.log(Reflect.getMetadata("propType2", A, "prop2"));
// console.log(Reflect.getMetadata("methodType2", A, "method2"));

// 6.
// const formatMetadataKey = Symbol("format");
// function format(str: string) {
//   return Reflect.metadata(formatMetadataKey, str);
// }

// function getFormat(target: any, key: string) {
//   return Reflect.getMetadata(formatMetadataKey, target, key);
// }

// class Greeter {
//   @format("Hello, %s")
//   greeting: string;
//   constructor(message: string) {
//     this.greeting = message;
//   }
//   greet() {
//     const formatString = getFormat(this, "greeting");
//     return formatString.replace("%s", this.greeting);
//   }
// }

// console.log(new Greeter("World").greet());

//  7.

class Point {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

class Line {
  private _p0: Point = { x: 0, y: 0 };
  private _p1: Point = { x: 0, y: 0 };

  @validate
  @Reflect.metadata("design:type", Point)
  set p0(value: Point) {
    this._p0 = value;
  }
  get p0() {
    return this._p0;
  }

  @validate
  @Reflect.metadata("design:type", Point)
  set p1(value: Point) {
    this._p1 = value;
  }
  get p1() {
    return this._p1;
  }
}

function validate<T>(
  target: any,
  propertyKey: string,
  descriptor: TypedPropertyDescriptor<T>
) {
  let set = descriptor.set!;
  descriptor.set = function (value: T) {
    let type = Reflect.getMetadata("design:type", target, propertyKey);
    if (!(value instanceof type)) {
      throw new TypeError("Invalid type.");
    }
    set.call(this, value);
  };
}

const line = new Line();
line.p0 = new Point(1, 1);
line.p1 = new Point(2, 1);
