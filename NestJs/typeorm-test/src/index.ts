import { AppDataSource } from "./data-source"
import { User } from "./entity/User"

AppDataSource.initialize().then(async () => {

   const user = new User()
    user.name = "张三"
    user.age = 18
    user.phone = "13800138000"
    user.desc = "这是一个描述信息。"
    user.score = 95.5

    // 保存数据
    await AppDataSource.manager.save(user)
    console.log("用户已保存：", user)

    // 查询数据
    const users = await AppDataSource.manager.find(User)
    console.log("所有用户：", users)

    // 保存数据
    const user2 = new User()
    user2.name = "李四"
    user2.age = 18
    user2.phone = "13800138001"
    user2.desc = "我是李四，学习第四，倒数的。"
    user2.score = 12.0


    await AppDataSource.manager.save(user2)
    console.log("用户已保存：", user2)

    // 查询单个数据
    const singleUser = await AppDataSource.manager.findOneBy(User, { id: user2.id })

    // 更新数据
    singleUser.age = 19
    await AppDataSource.manager.save(singleUser)
    console.log("用户已更新：", user)
    
    // 删除数据
    await AppDataSource.manager.remove(user)
    console.log("用户已删除：", user)

}).catch(error => console.log(error))
