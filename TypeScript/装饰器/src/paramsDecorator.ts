/**
 * 方法参数几乎和属性装饰器一致，只是多了一个属性
 **参数一：** 如果是静态属性，为类本身；如果是实例属性，为类的原型
 **参数二：** 字符串，表示方法名
 **参数三：** 表示参数顺序
 */

function paramDecortor(paramsName: string) {
  return function (target: Record<string, any>, key: string, index: number) {
    // 如果不存在，则进行初始化
    !target.__params && (target.__params = {});

    target.__params[index] = paramsName;
  };
}

class A {
  method1(
    @paramDecortor("id") id: number,
    @paramDecortor("name") name: string
  ) {
    console.log("正常方法内的执行：", id, name);
  }
}

const obj = new A();
obj.method1(1, "alvis");

// 打印原型看一眼（索引0对应第一个参数，一次类推）
console.log(A.prototype);
