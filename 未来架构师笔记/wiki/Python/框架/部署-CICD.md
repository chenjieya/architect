---
author: human
ai_editable: false
updated_by: human
updated: 2026-08-02
---

CI/CD 的全称是  **持续集成**（**Continuous Integration**）和  **持续交付**（**Continuous Delivery**）。

## 1. 创建 CICD 的镜像环境

下载镜像到本地

通过网盘分享的文件：python 框架 链接: [https://pan.baidu.com/s/1y_wrznlLD4AkmOwZANhT4A?pwd=t61z](https://pan.baidu.com/s/1y_wrznlLD4AkmOwZANhT4A?pwd=t61z)  提取码: t61z --来自百度网盘超级会员 v7 的分享

### 1.1 CI

1. ACR 创建新的镜像仓库：app-service-ci
2. 推送镜像到仓库：

   ```shell
   # 到下载的镜像所在目录
   docker load -i app-service-ci.tar
   # 修改成你的tag
   docker tag app-service-ci:latest 复制仓库公网地址:latest
   # 推送
   docker push 复制仓库公网地址:latest
   ```

### 1.2 CD

1. ACR 创建新的镜像仓库：app-service-cd
2. 推送镜像到仓库

   ```shell
   # 到下载的镜像所在目录
   docker load -i app-service-ci.tar
   # 修改成你的tag
   docker tag app-service-ci:latest 复制仓库公网地址:latest
   # 推送
   docker push 复制仓库公网地址:latest
   ```

### 1.3 python 环境

1. ACR 创建新的镜像仓库：python
2. 推送镜像

   ```shell
   docker buildx build --platform linux/amd64 \
     -t 复制仓库公网地址:3.14-slim \
     --push \
     - <<< 'FROM python:3.14-slim'
   ```

## 2. 阿里云效

将你的仓库关联到阿里云效

```shell
git remote add origin <仓库SSH地址>
```

### 2.1 创建 CI 流水线

1. 创建流水线
2. 触发方式选择：代码提交
3. 阶段 1 添加 CI 任务 4. 使用自定义的镜像源 5. 添加执行命令步骤

   ```shell
   uv sync --frozen --all-packages
   # make test
   # make test-e2e
   # make test-smoke
   make test-unit
   ```

   6. 添加通知插件

### 2.2 创建 CD 流水线

可以实际操作验证

环境变量：`${CI_COMMIT_REF_NAME}`

需要准备的环境变量：

- KUBECONFIG_BASE64：k8s config 的 base64 编码
  ```shell
  cat ~/.kube/config | base64
  ```
- ACR_USERNAME: 阿里云的账号
- ACR_PASSWORD：ACR 密码
- DOCKER_SERVER：ACR 的仓库专用网络地址
- DB_PASSWORD: 数据库密码
- JWT_SECRET_KEY：JWT 密钥

CD 执行的命令

```shell
# 写入 kubeconfig
echo "$KUBECONFIG_BASE64" | base64 -d > /tmp/kubeconfig

# 创建 ACR 拉取凭证
kubectl create secret docker-registry acr-registry-secret \
  --docker-server="$DOCKER_SERVER" \
  --docker-username="$ACR_USERNAME" \
  --docker-password="$ACR_PASSWORD" \
  --dry-run=client -o yaml \
  --kubeconfig /tmp/kubeconfig \
  --namespace default | \
kubectl apply -f - --kubeconfig /tmp/kubeconfig --namespace default

# Helm 部署
TAG=${CI_COMMIT_REF_NAME}
helm upgrade --install app-service ./k8s \
  --set image.tag=$TAG \
  --set secret.dbPassword="$DB_PASSWORD" \
  --set secret.jwtSecretKey="$JWT_SECRET_KEY" \
  --kubeconfig /tmp/kubeconfig \
  --namespace default
```
