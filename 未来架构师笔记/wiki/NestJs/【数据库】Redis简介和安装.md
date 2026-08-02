---
author: human
ai_editable: false
updated_by: human
updated: 2026-08-02
---

## 1. Redis 简介与安装

mysql 是通过硬盘来存储信息的，并且还要解析并执行 sql 语句，服务端其实最耗时的操作，就是连接数据等待数据库的查询结果，特别是一些非常耗时的查询，这些就成为了性能瓶颈。

解决这个问题的手段就是缓存，直接把结果缓存在内存中，下次查询直接查询缓存就行了。

所以做后端服务的时候，为了提升查询效率，我们不会只用 mysql，一般会结合内存数据库来做缓存，最常用的是 **Redis**

[Redis](https://redis.io/)是一个开源的内存数据结构存储系统，采用**键-值(Key-Value)对**的形式存储数据。支持多种数据结构，比如：字符串（string）、列表（list）、集合（set）、有序集合（sorted set)、哈希表（hash）、地理信息（geospatial）、位图（bitmap）和 JSON 等等。Redis 将数据存储在内存中，以实现快速查询，因此被广泛用于服务端开发中的中间件。在提升应用性能和处理高并发场景方面，起着至关重要的作用。

Redis 是分为服务端和客户端的，它提供了一个 `redis-cli` 的命令行客户端，当然也有可视化界面。

我们还是通过 Docker Desktop 直接下载 Redis 的 Image

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251210130958638.png)

可以直接点击`run`，下载并开启一个容器

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251210131013199.png)

redis 服务跑起来之后，我们可以先用 docker 容器中的 redis-cli 操作一下。

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251210131024631.png)

## 2. Redis 常用命令

上面简单写了一下字符串操作。Redis 提供了[一系列操作数据的命令](https://redis.io/docs/latest/develop/data-types/)

### 2.1 1、字符串操作

- SET key value：设置键-值对。
- GET key：根据键获取对应的值。
- MGET：获取多个键的值
- DEL key：删除键-值对
- INCR key：将键的值增加 1
- INCRBY key increment：将键的值增加指定的增量

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251210131044774.png)

### 2.2 2、列表操作

在 Redis 中，列表通常应用于消息队列、任务队列、时间线等场景，操作其实类似于 JS 中的数组操作。

列表操作的常用命令如下：

- LPUSH key value：将值推入列表左侧
- RPUSH key value：将值推入列表右侧
- LPOP key value：从列表左侧删除值
- RPOP key value：从列表右侧删除值
- LLEN key：获取列表长度
- LRANGE key start stop：获取列表指定范围的值

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251210131100914.png)

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251210131111507.png)

### 2.3 3、集合操作

在 Redis 中，集合由一组无序但唯一的成员组成。使用集合可以对数据执行交集、并集、差集等操作。

集合常用于标签系统，比如进行文章标签或者商品标签的管理，从而轻松的实现标签的组合和筛选

集合常用命令如下：

- SADD key member：向集合添加成员
- SREM key member：移除集合中的成员
- SMEMBERS key：获取集合的所有成员
- SINTER key1 key2：获取多个集合的交集

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251210131124251.png)

### 2.4 RedisInsight

如果觉得命令行不够清晰，也能下载 Redis 给我提供了 GUI，[官网下载](https://redis.io/insight/#insight-form)即可，不过下载之前需要稍微填写一下信息

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251210131147004.png)

安装成功之后，就会自动搜索到当前已经启动的 Redis 服务，点击这个数据库，就可以展示我们前面创建的各种类型的 key 和 value

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251210131158121.png)

现在可以通过工作，简单的进行操作即可

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251210131211558.png)

当然你要写 cli 命令也可以

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251210131224165.png)

### 2.5 4、有序集合操作

与集合不同，Sorted Set（有序集合，也被称为 ZSet）是由一组按照分数排序并且唯一的数据组成的，如果要用于比如排行榜的处理，就可以使用这种数据结构

有序集合常用的操作命令如下：

- ZADD key socre member：向有序集合添加成员及其分数
- ZRANGE key start stop：按分数范围获取有序集合的成员

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251210131236138.png)

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251210131252585.png)

通过命令操作一下

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251210131301551.png)

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251210131309357.png)

### 2.6 5、哈希操作

- HSET key field value：设置哈希字段的值
- HGET key field：获取哈希字段的值
- HGETALL key：获取哈希的所有字段和值

哈希结构适用于存储复杂对象结构的数据，例如用户信息，订单信息等等，每个 Key 代表不同的对象，field value 代表对象的属性和值。比如要存储`user`信息，执行如下的命令设置字段：

```typescript
HSET user id 1
HSET user name jack
HSET user age 22
```

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251210131322145.png)

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251210131331307.png)

### 2.7 6、地理空间操作

常用命令如下：

- GEOADD key longitude latitude member：根据经纬度添加坐标成员
- GEOPOS key member [member...]：获取一个或多个成员的地理位置坐标
- GEOSEARCH key <FROMMEMBER | FROMLONLAT><BYRADIUS|BYBOX><...>：根据不同条件获取成员坐标
- GEODIST key member1 member2 [unit]：计算坐标成员之间的距离

Redis 可以用于存储地理空间的坐标，并支持在给定半径和范围边界内进行搜索。地图相关的场景都会用到这种数据操作，比如共享单车、充电宝等等场景

可以执行以下命令添加几个坐标位置，坐标位置可以用用百度的[坐标拾取器](https://api.map.baidu.com/lbsapi/getpoint/index.html)

```typescript
GEOADD share_bikes 116.437326 39.951837 bike1
GEOADD share_bikes 116.433877 39.94874 bike2 116.436177 39.950952 bike3
```

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251210131341639.png)

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251210131350317.png)

比如获取 bike1 和 bike2 的坐标信息

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251210131359589.png)

还能增加一些条件，给定一个经纬度，查询这个坐标 5KM 范围内的自行车，结果会自动按照从近到远的顺序输出

```typescript
GEOSEARCH share_bikes FROMLONLAT 116.436464 39.94791 BYRADIUS 5 km asc
```

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251210131410468.png)

### 2.8 7、位图操作

位图常用操作命令如下：

- SETBIT key offset value：给指定偏移量的位设置 0 或 1
- GETBIT key offset：获取指定偏移量的位
- BITCOUNT key：获取指定位位 1 的总计数

在应用中，如果我们希望记录用户的活跃状态、在线状态、访问频率等等，就可以使用位图。

比如，我们统计用户 1001 在 30 天内的访问频率，假设他在第 10、20、30 天都有访问记录：

```typescript
SETBIT user:1001:visit 10 1
SETBIT user:1001:visit 20 1
SETBIT user:1001:visit 30 1
```

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251210131422855.png)

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251210131431236.png)

我们通过条件来看一下，比如判断该用户在第 15 天有没有访问记录：

```typescript
GETBIT user:1001:visit 15
```

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251210131439615.png)

或者统计用户总共有多少次访问记录

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251210131447388.png)

上面基本上就是一些常用的 redis 结构和命令，当然还有一些 cli 并没有一一介绍，大家可以自行去查阅，过一遍基本也就会了。
