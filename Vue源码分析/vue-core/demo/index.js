const obj = {
  firstName: "chen",
  lastName: "jie",
  get fullName() {
    return this.firstName + this.lastName;
  }
};

const proxy = new Proxy(obj, {
  get(target, key, revicer) {
    // 错误❌： 直接访问会造成递归，一直循环访问
    // return revicer[key];
    // 正确： 为什么Reflect不会造成递归呢？ 因为是直接调用的底层，相当于调用的是原始对象的get.
    const desc = Object.getOwnPropertyDescriptor(target, key);
    console.log(desc);
    if (desc && desc.get) {
      // desc.get 是这样调用的， 不是revicer.get 这样就不会出发proxy了
      return desc.get.call(revicer);
    }
    return target[key];
  }
});

console.log(proxy.fullName);
