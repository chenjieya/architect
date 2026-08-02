---
author: human
ai_editable: false
updated_by: human
updated: 2026-08-02
---

1. 帮助命令

```shell
docker version   # 显示docker版本信息
docker info      # 显示docker的系统信息，包括镜像、容器数量
docker 命令 --help # 万能命令
```

2. 镜像命令

- 列出镜像

```shell
docker images

-a    # 列出所有镜像
-q    # 只显示镜像id
```

- docker search 搜索镜像

```shell
docker search mysql
```

- docker pull 下载镜像

```shelll
docker pull mysql

docker pull 镜像名[:tag]
```

- docker rmi 删除镜像

```shell
docker rmi -f 镜像id

docker rmi -f $(docker iamges -aq)  # 递归删除所有的镜像
```

3. 容器命令

- 新建容器并启动

```shell
docker run [可选参数] 镜像id

# 可选参数
--name="alvis"    # 容器名字
-d                # 后台方式运行
-it               # 使用交互方式运行，进入容器查看内容
-p                # 指定容器端口（宿主机端口：容器端口）
	-p # IP:主机端口：容器端口
	-p # 主机端口：容器端口（常用）
	-p # 容器端口
-P                # 随机指定端口

# 测试命令
docker run -it centos /bin/bash   # 启动并进入到容器的bash终端
```

- 列出运行的容器

```shell
docker ps #列出运行的容器
docker ps -a #曾经运行的容器
```

- 退出容器

```shell
exit  # 推出容器，容器停止运行
Ctrl + p + q  # 推出容器，容器仍在运行
```

- 删除容器

```shell
docker rm 容器id
docker rm -f $(docker ps -aq)  # 删除所有容器
```

- 启动和停止容器操作

```shell
docker start 容器id    # 启动容器
docker restart 容器id  # 重启容器
docker stop 容器id     # 停止当前正在运行的容器
docker kill 容器id     # 强制停止当前容器
```

## 1. 常用其他命令

```shell
docker run -d centos     # 问题： docker ps 发现centos停止了

# 常见的坑：docker容器使用在后台运行，就必须要有一个前台进程，docker发现没有应用，就会自动停止。

# 自己编写一段脚本
docker run -d centos /bin/sh -c "while true;do echo alvis;sleep 2;done"

# 查看日志
docker logs -tf --tail 10 容器id
```

- 查看容器内部进程信息

```shell
docker top 容器id
```

- 查看容器信息

```shell
docker inspect 容器id
```

- 进入当前正在运行的容器

```shell
# 我们通常容器都是使用后台方式运行的，需要进入容器，修改一些配置


# 命令
docker exec -it 容器id /bin/bash    # 进入容器开启一个新的终端

docker attach 容器id      # 进入容器正在执行的终端
```

- 从容器内拷贝文件到主机上

```shell
docker cp 容器id: 容器内路径 主机路径

# 测试代码
docker run -it centos /bin/bash   # 运行容器并进入到容器内部
# 容器内部
cd /home
touch test.java
exit

# 宿主机
dokcer cp 容器id:/home/test.java /home
```

- 查看内存

```shell
docker stats 容器id
```

- commit 镜像

```shell
docker commit -m='提交的描述信息' -a= '作者' 容器id 目标镜像名:[TAG]
```

## 2. 小结

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/picgo-1300696809/obsidian202310231317693.png?imageSlim)
