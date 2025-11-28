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
  constructor() {
    // 直接在构造函数中创建依赖
    this.paymentService = new PaymentService(); // 直接创建 PaymentService 实例
    this.shippingService = new ShippingService(); // 直接创建 ShippingService 实例
  }

  createOrder(amount, address) {
    console.log(`创建订单金额： $${amount}`);

    // 调用 paymentService 进行支付
    const paymentSuccess = this.paymentService.processPayment(amount);

    if (paymentSuccess) {
      console.log(`订单创建成功!`);

      // 调用 shippingService 发货
      this.shippingService.shipOrder({ address });
    } else {
      console.log(`付款失败。订单创建已中止!`);
    }
  }
}

// 直接创建 OrderService 的实例，而不是从容器获取
const orderService = new OrderService();

// 创建订单
orderService.createOrder(200, "成都市天府三街");
