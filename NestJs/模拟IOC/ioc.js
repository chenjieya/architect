class Ioc {
  constructor() {
    this.serviceMap = new Map();
  }

  register(serviceName, service) {
    this.serviceMap.set(serviceName, service);
    return this;
  }

  getService(serviceName) {
    const service = this.serviceMap.get(serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not found!`);
    }

    // 如果服务是一个函数，则执行它，创建一个实列
    if (typeof service === "function") {
      // 创建一个实列
      const instance = service(this);
      // 缓存实列
      this.register(serviceName, instance);
      return instance;
    }

    return service;
  }
}

class PaymentService {
  processPayment(amount) {
    console.log(`处理付款金额: $${amount}`);
    return true; // 假设支付成功
  }
}

class ShippingService {
  shipOrder(orderDetails) {
    console.log(`订单发货至: ${orderDetails.address}`);
  }
}

class OrderService {
  constructor(PaymentService, ShippingService) {
    this.paymentService = PaymentService;
    this.shippingService = ShippingService;
  }

  createOrder(amount, address) {
    console.log(`创建订单金额：$${amount}`);
    const paymentSuccess = this.paymentService.processPayment(amount);
    if (paymentSuccess) {
      console.log(`订单创建成功!`);
      this.shippingService.shipOrder({ address });
    } else {
      console.log(`付款失败。订单创建已中止!`);
    }
  }
}

const ioc = new Ioc()
  .register("PaymentService", new PaymentService())
  .register("ShippingService", new ShippingService());

ioc.register("OrderService", (ioc) => {
  return new OrderService(
    ioc.getService("PaymentService"),
    ioc.getService("ShippingService")
  );
});

// 从容器中获取 OrderService，并创建一个订单
const orderService = ioc.getService("OrderService");
orderService.createOrder(200, "成都市天府三街");
