---
author: human
ai_editable: false
updated_by: human
updated: 2026-08-02
---

K8s 的全称是  **Kubernetes**。它是一个**用于自动部署、扩缩和管理容器化应用程序的开源系统**

![image-20260703205044579](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/obsidian/1785576822308_202607032050643.png)

## 1. 创建 ACS 集群

1. 搜「ACS」，进入 容器计算服务 ACS 控制台
2. 开通服务：根据提示一步一步操作，全部默认
3. 创建集群：
   - 集群名称：app-cluster
   - 地域：vpc 所在地域
   - 专有网络：使用已有，选两个交换机（带有 pod 名称的）
   - SNAT 暂不勾选
   - 安全组：普通安全组
   - API Server：勾选 EIP 暴露 API Server
   - ingress：暂不创建
   - 其他默认

等待集群建立完成（5 ～ 10 分钟左右）

等待期间，你可以删除 ACR 的 latest 镜像，重新使用带有版本号标记的镜像

## 2. 部署服务

1. 进入刚才创建的集群详情页，找到连接信息
2. 根据提示安装`kubectl`
3. 获取长期 config，选公网访问
4. 按照提示，将复制的 config 保存到指定位置
5. 本地运行`kubectl get nodes`，看是否能看到节点
6. 配置`docker`的拉取地址和身份信息

   ```shell
   export ACR_PASSWORD='<acr的密码>'

   # 创建拉取凭证
   kubectl create secret docker-registry acr-registry-secret \
     --docker-server=<acr的内网地址> \
     --docker-username=<阿里云用户名> \
     --docker-password="$ACR_PASSWORD"
   ```

7. 安装  `VSCode`  插件  `Kubernetes`  和  `Kubernetes Templates`
8. 安装  `Helm`

   - Mac: `brew install helm`
   - windows: 使用 windows 的包管理工具，或者问 AI

9. 应用配置

   ```shell
   export DB_PASSWORD='<数据库密码>'
   export JWT_SECRET_KEY='<jwt密钥>'

   helm upgrade --install app-service ./k8s \
     --set secret.dbPassword="$DB_PASSWORD" \
     --set secret.jwtSecretKey="$JWT_SECRET_KEY" \
   ```

10. 查看应用状态

    ```shell
    kubectl get pods
    ```

11. 配置 ALB
    1. 阿里云搜索 SLB，创建 ALB 2. 地域和 VPC 相同 3. 选择公网 4. 选择 VPC 5. 选择两个 VPC 的交换机所在的可用区 6. 交换机选之前 ACS 集群没选过的（不带 pod） 7. 标准版 8. 实例名称你看着取
    2. 为域名添加 CNAME 记录，指向 ALB 的 DNS
    3. 安装 ALB Ingress Controller
    4. 进入容器计算服务
    5. 组件管理：搜索 ALB Ingress Controller
    6. 安装，选择已有的 Ingress
    7. 等待安装完成
    8. 网络 / 路由
    9. 创建 Ingress
    10. 名称自行填写
    11. 服务选择 app-service
    12. 端口 8080
    13. 监听：回到 ALB
    14. 80 端口：已自动创建好了，编辑规则转发规则，重定向到 443
    15. 443 端口
