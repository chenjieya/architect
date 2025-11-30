// 装饰器，在正常函数执行之前执行的函数
function Before(fn: (...args: any[]) => any) {
  // 返回真正的装饰器
  return function (
    target: Record<string, any>,
    key: string,
    desc: PropertyDescriptor
  ) {
    const temp = desc.value!; // 缓存最原始的函数

    desc.value = function (...args: any[]) {
      fn.call(this, ...args); // 先执行传入的函数
      return temp.call(this, ...args); // 再执行最原始的函数
    };
  };
}

// 装饰器，在正常函数执行之后执行的函数
function After(fn: (...args: any[]) => any) {
  // 返回真正的装饰器
  return function (
    target: Record<string, any>,
    key: string,
    desc: PropertyDescriptor
  ) {
    const temp = desc.value!; // 缓存最原始的函数

    desc.value = function (...args: any[]) {
      const res = temp.call(this, ...args);
      fn.call(this, ...args);
      return res;
    };
  };
}

class Test {
  @Before(function (name: string) {
    console.log(`Before method execution: preparing to greet ${name}`);
  })
  @After((result: string, name: string) => {
    console.log(
      `After method execution: greeted ${name} with result "${result}"`
    );
  })
  greet(name: string): string {
    console.log(`正常函数内部执行：Hello, ${name}!`);
    return `Hello, ${name}!`;
  }
}

const obj = new Test();
const res = obj.greet("World");
console.log(`函数返回值打印：${res}`);
