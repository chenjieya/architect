
> linux系统查看网络ip命令 `ip addr`

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/picgo-1300696809/obsidian202310240851045.png?imageSlim)


**结论：** centos01和centos02是公用的一个路由器，docker0。 所有的容器在不指定网络情况下，都是docker0路由的，docker会给我们容器分配一个默认的可用IP。

```shell
# 启动一个docker容器（centos01）
docker run -it --name centos01 centos:7

# 该容器没有网络工具
yum install net-tools

# 查看容器内部网络ip
ifconfig   # 172.17.0.2

# 将容器打包
docker build -m="包含网络工具" -a="alvis" centos/net

# 启动另一个docker容器（centos02）
docker run -it --name centos02 centos/net /bin/bash

# 查看网路ip
ifconfig  # 172.17.0.3

# 从容器内相互ping 结果可以ping通
```

> 更加生动的网络图
![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/picgo-1300696809/obsidian202310240915569.png?imageSlim)

> [!info]
> 只要容器删除，对应的网桥一对就没了

##### 2. 容器互联 --link（不推荐使用了）

> 通过两个容器的名称相互ping通

```shell
# 现在有两个容器正在启动： centos01  centos02

# 这样是ping不通的
docker exec -it centos01 ping centos02

# 现在在开启一个容器，并和centos02容器建立互联
docker run -it --name centos03 --link centos02 centos/net 

# 
docker exec -it centos03 ping centos03  # 通了

# 但是反向 centos03 ping centos02 ping不通

```

> [!info] --link
> --link就是在我们的hosts配置中增加了一个映射 ==172.17.0.3           centos02 容器id==


##### 3. 自定义网络

```shell
# docker neteork --help 网路命令

docker network ls # 查看所有的网络
```

> [!info] 网络模式
> bridge: 桥接模式 在网络之间搭桥  0.2 和 0.3不能访问，但是通过0.1搭桥就行了
> none: 不配置网络
> host: 和宿主机共享网络
> container: 容器网络连通（用的少，局限大）

```shell
# 我们直接启动的命令 --net bridge 而这个就是我们的docekr0
docekr run -d -P --name tomcat01 --net bridge tomcat

# 创建网络 --submet子网  --gateway网关
docker network create --driver bridge --subnet 192.168.0.0/16 --gateway 192.168.0.1 mynet

# 在该网络下创建两个容器 centos-net-01、centos-net-02
docker run -it --name centos-net-01 --net mynet centos/net /bin/bash  # 192.168.0.2
docker run -it --name centos-net-02 --net mynet centos/net /bin/bash  # 192.168.0.3

# 通过自定义网络搭建的容器，自带--link功能
docker exec -it centos-net-01 ping centos-net-02  # 可以ping通

# 在另一个网卡上，默认网卡docker0，启动两个容器
docker run -it --name centos01 centos/net /bin/bash  # 172.17.0.2
docker run -it --name centos02 centos/net /bin/bash  # 172.17.0.3

# 问题？ 容器centos01 能和 centos-net-01 ping通吗？ ping不通
# 但是可以通过将centos01的网络链接到mynet网卡下， 是centos01容器变成两个ip
docker network connect mynet centos01

# 查看mynet下
docker network inspect mynet

# 发现centos01容器
ip: 192.168.0.4

# 测试能否ping通
docker exec -it centos-net-01 ping centos01   # 成功了
```

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/picgo-1300696809/obsidian202310241028948.png?imageSlim)


