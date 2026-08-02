---
author: human
ai_editable: false
updated_by: human
updated: 2026-08-02
---

> Centos 安装 docker

## 1. docker 安装

- 卸载旧得版本

```shell
$ sudo yum remove docker \
                  docker-client \
                  docker-client-latest \
                  docker-common \
                  docker-latest \
                  docker-latest-logrotate \
                  docker-logrotate \
                  docker-selinux \
                  docker-engine-selinux \
                  docker-engine
```

- 使用 yum 安装

```shell
$ sudo yum install -y yum-utils
```

- 更换国内源

```shell
$ sudo yum-config-manager \
    --add-repo \
    https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo

$ sudo sed -i 's/download.docker.com/mirrors.aliyun.com\/docker-ce/g' /etc/yum.repos.d/docker-ce.repo

# 官方源
# $ sudo yum-config-manager \
#     --add-repo \
#     https://download.docker.com/linux/centos/docker-ce.repo
```

- 安装 docker

```shell
$ sudo yum install docker-ce docker-ce-cli containerd.io
```

- 启动 docker

```shell
systemctl start docker

docker --version
```

- 运行 hello-world 项目

```shell
docker run hello-world
```

- 查看 hello-world 镜像

```shell
docker images
```

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/picgo-1300696809/obsidian202310231104001.png?imageSlim)

## 2. 卸载 docker

- 卸载依赖

```shell
yum remove docekr-ce docker-ce-cli containerd.io
```

- 删除资源

```shell
rm -rf /var/lib/docker
```

## 3. 阿里云镜像加速

- 登录阿里云网站
- 找到容器镜像服务
  ![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/picgo-1300696809/obsidian202310231111611.png?imageSlim)

- 配置镜像加速

```shell
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{ "registry-mirrors": ["https://3g5i8pm4.mirror.aliyuncs.com"] }
EOF

sudo systemctl daemon-reload
sudo systemctl restart docker
```
