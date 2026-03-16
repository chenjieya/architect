## 1. [reflect-metadata](https://www.npmjs.com/package/reflect-metadata)

`reflect-metadata` 是一个 JavaScript 库，用于在运行时访问和操作装饰器的元数据。它提供了一组 API，可以读取和写入装饰器相关的元数据信息。

我上面通过自己封装函数来处理类和类成员相关的元数据，但是相关能力比较薄弱，借助 Reflect-metadata 来解决提供元数据的处理能力。

### 1.1 安装

```javascript
npm install reflect-metadata
```

**`tsconfig.json`设置**

```typescript
"experimentalDecorators": true,
"emitDecoratorMetadata": true
```

**引入**

```typescript
import 'reflect-metadata'
```

### 1.2 基本语法

#### 1.2.1 定义元数据

**声明性定义：**

```typescript
@Reflect.metadata(metadataKey, metadataValue)
```

```typescript
@Reflect.metadata('classType', 'A类-1')
class A {
  prop1: string
  method() {}
}
```

**命令式定义：**

```typescript
Reflect.defineMetadata(metadataKey, metadataValue, 定义元数据的对象, propertyKey?);
```

```typescript
class A {
  prop1: string
  method() {}
}

Reflect.defineMetadata('classType', 'A类-2', A)
```

#### 1.2.2 获取元数据

```typescript
Reflect.getMetadata(metadataKey, 定义元数据类):返回metadataValue
```

```typescript
console.log(Reflect.getMetadata('classType', A))
```

### 1.3 工厂模式

也可以将上面的处理封装为工厂模式，使用起来更加方便

**方式1：**

```typescript
const ClassTypeMetaKey = Symbol('classType')

function ClassType(type: string) {
  return Reflect.metadata(ClassTypeMetaKey, type)
}

@ClassType('A类-1')
class A {
  prop1: string
  method() {}
}

console.log(Reflect.getMetadata(ClassTypeMetaKey, A))
```

**方式2：**

```typescript
type constructor<T = any> = new (...args: any[]) => T

const ClassTypeMetaKey = Symbol('classType')

function ClassType(type: string) {
  return <T extends constructor>(target: T) => {
    Reflect.defineMetadata(ClassTypeMetaKey, type, target)
  }
}

@ClassType('A类-2')
class A {
  prop1: string
  method() {}
}

console.log(Reflect.getMetadata(ClassTypeMetaKey, A))
```

### 1.4 成员属性和方法的处理

基本语法API都基本差不多，不过属性和方法是有两种状态的，**实例的和静态的，对应的对象分别是对象原型和类本身**

```typescript
class A {
  // @Reflect.metadata("propType1", "prop1-value")
  prop1: string
  // @Reflect.metadata("propType2", "prop2-value")
  static prop2: string

  @Reflect.metadata('methodType1', 'method1-value')
  method1() {}

  @Reflect.metadata('methodType2', 'method2-value')
  static method2() {}
}

Reflect.defineMetadata('propType1', 'prop1-value', A.prototype, 'prop1')
Reflect.defineMetadata('propType2', 'prop2-value', A, 'prop2')

console.log(Reflect.getMetadata('propType1', A.prototype, 'prop1'))
console.log(Reflect.getMetadata('propType2', A, 'prop2'))

console.log(Reflect.getMetadata('methodType1', A.prototype, 'method1'))
console.log(Reflect.getMetadata('methodType2', A, 'method2'))
```

我们可以稍微封装一下，简单的得到一些我们想要的效果:

```typescript
const formatMetadataKey = Symbol('format')
function format(formatString: string) {
  return Reflect.metadata(formatMetadataKey, formatString)
}
function getFormat(target: any, propertyKey: string) {
  return Reflect.getMetadata(formatMetadataKey, target, propertyKey)
}

class Greeter {
  @format('Hello, %s')
  greeting: string
  constructor(message: string) {
    this.greeting = message
  }
  greet() {
    let formatString = getFormat(this, 'greeting')
    return formatString.replace('%s', this.greeting)
  }
}

const objG = new Greeter('world')
// console.log(objG.greet()); // "Hello, world"

const objG = new Greeter('world')
// console.log(objG.greet());

// greet封装在外面也是一样的道理
function greet(obj: any, key: string) {
  let formatString = getFormat(obj, key)
  return formatString.replace('%s', obj[key])
}

const g = greet(objG, 'greeting')
console.log(g)
```
