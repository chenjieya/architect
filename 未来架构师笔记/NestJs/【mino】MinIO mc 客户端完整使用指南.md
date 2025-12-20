
- ✅ MinIO / mc 是什么
    
- ✅ mc 在 **Windows / macOS（Intel & Apple Silicon）/ Linux** 的安装
    
- ✅ mc 基本概念（alias / user / policy / bucket）
    
- ✅ **完整可复制的 mc 命令脚本模板**
    
- ✅ Bucket 权限、匿名访问、API 对接
    
- ✅ 删除 Bucket（含非空、版本控制）
    
- ✅ 常见坑和排错建议
    

---

> 适用于 **最新 MinIO Docker 镜像（UI 9001 功能受限版本）**  
> 管理用户 / AccessKey / Bucket 权限 **必须使用 mc 或 API**

---

## 1. MinIO & mc 简介

### 1️.1 MinIO 是什么

MinIO 是一个 **兼容 Amazon S3 API 的对象存储服务**，常用于：

- 私有云对象存储
- Kubernetes 存储
- 替代 AWS S3（本地 / 内网）

默认端口：

- **9000**：S3 API
- **9001**：Web Console（新版仅浏览）
    
---
### 2️. mc 是什么

`mc（MinIO Client）` 是 MinIO 官方命令行工具，用于：

- 用户 / AccessKey 管理
- Bucket 管理
- 权限策略（Policy）
- 文件上传、下载、删除
- 管理对象版本、锁定等

📌 **最新 MinIO 社区版：mc 是唯一管理方式**

---
## 2. mc 安装方式(Windows 安装 mc)

---
### 2.1 官方二进制（推荐）

1️⃣ 下载：

```powershell
curl -O https://dl.min.io/client/mc/release/windows-amd64/mc.exe
```

2️⃣ 放到 PATH 目录，例如：

```text
C:\Windows\System32\
```

或自定义目录并加入环境变量。

3️⃣ 验证：

```powershell
mc --version
```

---

### 2.2 Chocolatey

```powershell
choco install minio-client
```

---

✅ macOS 安装 mc

### 2.3 Homebrew（推荐）

```bash
brew install minio/stable/mc
```

验证：

```bash
mc --version
```

---

### 2.4 官方二进制

#### 2.4.1 Intel 芯片：

```bash
curl -O https://dl.min.io/client/mc/release/darwin-amd64/mc
chmod +x mc
sudo mv mc /usr/local/bin/
```

#### 2.4.2 Apple Silicon（M1 / M2 / M3）：

```bash
curl -O https://dl.min.io/client/mc/release/darwin-arm64/mc
chmod +x mc
sudo mv mc /usr/local/bin/
```

---

✅ Linux 安装 mc

```bash
curl -O https://dl.min.io/client/mc/release/linux-amd64/mc
chmod +x mc
sudo mv mc /usr/local/bin/
```

---

## 3. mc 核心概念速览

|概念|说明|
|---|---|
|alias|MinIO 实例的别名|
|user|AccessKey / SecretKey|
|policy|权限策略（JSON）|
|bucket|存储桶|
|object|对象（文件）|

---

## 4. mc 初始化配置（alias）

### 4.1 MinIO 启动示例（Docker）

```bash
docker run -d \
  -p 9000:9000 \
  -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin123 \
  minio/minio server /data --console-address ":9001"
```

---

### 4.2 设置 alias

```bash
mc alias set myminio http://127.0.0.1:9000 minioadmin minioadmin123
```

查看：

```bash
mc alias list
```

---

## 5. Bucket 管理（完整）

### 5.1 创建 Bucket

```bash
mc mb myminio/mybucket
```

---

### 5.2 查看 Bucket

```bash
mc ls myminio
```

---

### 5.3 删除 Bucket（空桶）

```bash
mc rb myminio/mybucket
```

---

### 5.4 删除 Bucket（非空）

```bash
mc rm -r --force myminio/mybucket
mc rb myminio/mybucket
```

---

## 6. 用户 / AccessKey 管理（重点）

### 6.1 创建用户（AccessKey）

```bash
mc admin user add myminio appuser appsecret123
```

📌

- `appuser` = AccessKey
    
- `appsecret123` = SecretKey
    

---

### 6.2 查看用户

```bash
mc admin user list myminio
```

---

### 6.3 禁用 / 启用用户

```bash
mc admin user disable myminio appuser
mc admin user enable myminio appuser
```

---

### 6.4 删除用户

```bash
mc admin user remove myminio appuser
```

---

## 7. 权限策略（Policy）管理

---

### 7.1 使用内置策略（快速）

| 策略        | 权限   |
| --------- | ---- |
| readonly  | 只读   |
| writeonly | 只写   |
| readwrite | 读写   |
| admin     | 管理权限 |

```bash
mc admin policy attach myminio readwrite --user appuser
```

---

### 7.2 自定义 Bucket 权限策略（推荐）

#### 7.2.1 创建 policy 文件：`mybucket-rw.json`

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::mybucket/*"
      ]
    }
  ]
}
```

---

#### 7.2.2 添加并绑定策略

```bash
mc admin policy add myminio mybucket-rw mybucket-rw.json
mc admin policy attach myminio mybucket-rw --user appuser
```

---

## 8. Bucket 公共访问（匿名）

### 8.1 设置公开读（如图片访问）

```bash
mc anonymous set download myminio/mybucket
```

查看状态：

```bash
mc anonymous get myminio/mybucket
```

取消公开：

```bash
mc anonymous set none myminio/mybucket
```

---

## 9. API 对接示例（S3 兼容）

### 9.1 Python（boto3）

```python
import boto3

s3 = boto3.client(
    "s3",
    endpoint_url="http://127.0.0.1:9000",
    aws_access_key_id="appuser",
    aws_secret_access_key="appsecret123",
)

print(s3.list_buckets())
```

---

### 9.2 Java / Go / Node.js

👉 **全部使用标准 S3 SDK**，只需要指定 `endpoint_url`

---

## 10. 常见问题 & 坑

### 10.1 ❓ UI 为什么没有 AccessKey？

✅ **新版 MinIO 社区版移除了管理 UI**，这是官方行为。

---

### 10.2 ❓ 删除 Bucket 报错？

- 桶不为空
    
- 开启了版本控制
    
- 开启了 Object Lock
    

解决：

```bash
mc rm -r --versions --force myminio/mybucket
```

---

### 10.3 ❓ mc 连接失败？

- 检查 9000 端口
    
- 检查 Root 用户名密码
    
- Docker 是否映射端口
    

---

## 11. 最佳实践建议

- 🚫 **不要用 Root 用户给应用**
    
- ✅ 每个应用一个 AccessKey
    
- ✅ 一个 Bucket 一个 policy
    
- ✅ 公共读仅用于静态资源
    

---

## 12. 结语

> 在 **最新 MinIO 镜像中：**
> 
> - **UI 只用于浏览**
>     
> - **mc 是核心管理工具**
>     
> - **API 完全兼容 S3**
>     

---
