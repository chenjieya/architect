import { AppDataSource } from "./data-source";
import { Department } from "./entity/Department";
import { Employ } from "./entity/Employ";
import { IdCard } from "./entity/IdCard";
import { Order } from "./entity/Order";
import { Product } from "./entity/Product";
import { User } from "./entity/User";

// AppDataSource.initialize().then(async () => {

//    const user = new User()
//     user.name = "张三"
//     user.age = 18
//     user.phone = "13800138000"
//     user.desc = "这是一个描述信息。"
//     user.score = 95.5

//     // 保存数据
//     await AppDataSource.manager.save(user)
//     console.log("用户已保存：", user)

//     // 查询数据
//     const users = await AppDataSource.manager.find(User)
//     console.log("所有用户：", users)

//     // 保存数据
//     const user2 = new User()
//     user2.name = "李四"
//     user2.age = 18
//     user2.phone = "13800138001"
//     user2.desc = "我是李四，学习第四，倒数的。"
//     user2.score = 12.0

//     await AppDataSource.manager.save(user2)
//     console.log("用户已保存：", user2)

//     // 查询单个数据
//     const singleUser = await AppDataSource.manager.findOneBy(User, { id: user2.id })

//     // 更新数据
//     singleUser.age = 19
//     await AppDataSource.manager.save(singleUser)
//     console.log("用户已更新：", user)

//     // 删除数据
//     await AppDataSource.manager.remove(user)
//     console.log("用户已删除：", user)

// }).catch(error => console.log(error))

// async function main() {
//   try {
//     await AppDataSource.initialize();
//     const userResponistry = AppDataSource.getRepository(User);

//     const user = new User();
//     user.name = "王五";
//     user.age = 18;
//     user.phone = "13800138000";
//     user.desc = "我是王五，这是我的自我介绍";
//     user.score = 95.5;

//     // 查询
//     const findUser = await userResponistry.findOneBy({ name: "王五" });

//     console.log("查询结果：", findUser);

//     if (!findUser) {
//       // 不存在则添加用户
//       await userResponistry.save(user);
//       console.log("用户已保存：", user);
//     }

//     // 更新
//     findUser.age = 20;
//     await userResponistry.save(findUser);
//     console.log("用户已更新：", findUser);
//   } catch (error) {
//     console.log(error);
//   }
// }

// async function main() {
//   try {
//     await AppDataSource.initialize();
//     // AppDataSource.createQueryBuilder()
//     //   .select("user")
//     //   .from(User, "user")
//     //   .where("user.age > :age", { age: 18 })
//     //   .getMany()
//     //   .then((users) => {
//     //     console.log("查询结果：", users);
//     //   });

//     const user = new User();
//     user.name = "赵六";
//     user.age = 22;
//     user.phone = "13800138002";
//     user.desc = "我是赵六，这是我的自我介绍";
//     user.score = 88.8;

//     const user2 = new User();
//     user2.name = "力气";
//     user2.age = 13;
//     user2.phone = "1380013800123";
//     user2.desc = "这是一段自我描述";
//     user2.score = 88.8;

//     //  插入数据
//     await AppDataSource.createQueryBuilder()
//       .insert()
//       .into(User)
//       .values(user)
//       .execute();

//     //   查询数据
//     AppDataSource.createQueryBuilder()
//       .select("user")
//       .from(User, "user")
//       .getMany()
//       .then((users) => {
//         console.log("查询结果：", users);
//       });
//   } catch (error) {
//     console.log(error);
//   }
// }

// 一对一链表
// async function main() {
//   try {
//     await AppDataSource.initialize();

//     // const user = new User();
//     // user.name = "赵六";
//     // user.age = 22;
//     // user.phone = "13800138002";
//     // user.desc = "我是赵六，这是我的自我介绍";
//     // user.score = 88.8;

//     // // // 创建身份证对象
//     // const idCard = new IdCard();
//     // idCard.cardNo = "110101199003076578";
//     // idCard.name = "赵六";
//     // idCard.address = "北京市朝阳区幸福大街001号";
//     // idCard.birthday = new Date("1990-03-07");
//     // idCard.email = "123@163.com";

//     // // // 建立关系
//     // user.idCard = idCard;

//     // // 保存用户（会级联保存身份证）
//     // await AppDataSource.manager.save(user);
//     // console.log("用户及身份证已保存：", user);

//     // 更新
//     // const userRepository = AppDataSource.getRepository(User);

//     // const userAndCard = await userRepository.findOne({
//     //   where: { id: 8 },
//     //   relations: { idCard: true },
//     // });
//     // console.log(userAndCard);

//     // userAndCard.idCard.address = "北京市海淀区中关村大街001号";

//     // await userRepository.save(userAndCard);
//     // console.log("用户及身份证已更新：", userAndCard);
//   } catch (error) {
//     console.log(error);
//   }
// }

// 一对多
// async function main() {
//   try {
//     await AppDataSource.initialize();

//     const depart = new Department();
//     depart.name = "技术部";
//     depart.desc = "前端技术部";

//     const employ = new Employ();
//     employ.name = "Alvis";

//     const employ1 = new Employ();
//     employ1.name = "chenjie";

//     depart.employs = [employ, employ1];

//     const departRepositry = AppDataSource.getRepository(Department);
//     const res = await departRepositry.save(depart);
//     console.log(res);
//   } catch (error) {
//     console.log(error);
//   }
// }

// 多对多
async function main() {
  try {
    await AppDataSource.initialize();

    const order1 = new Order();
    order1.name = "订单1";
    const order2 = new Order();
    order2.name = "订单2";

    const product1 = new Product();
    product1.name = "产品1";
    const product2 = new Product();
    product2.name = "产品2";
    const product3 = new Product();
    product3.name = "产品3";
    const product4 = new Product();
    product4.name = "产品4";

    order1.products = [product1, product2, product3];
    order2.products = [product1, product2, product3, product4];

    const orderRepository = AppDataSource.getRepository(Order);
    await orderRepository.save(order1);
    await orderRepository.save(order2);
  } catch (error) {
    console.log(error);
  }
}

main();
