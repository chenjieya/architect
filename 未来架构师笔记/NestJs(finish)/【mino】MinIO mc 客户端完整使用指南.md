适用场景：使用最新 MinIO 社区版（UI 9001 仅浏览），需要用 `mc` 管理用户、密钥、Bucket、权限策略和对象。

## 1. 关键概念（先搞懂再动手）

- 对象存储 vs 传统文件存储：对象存储以「对象」为单位管理，每个对象由数据+元数据组成，通过 S3 API 访问，适合图片、日志、备份等。
- 端口：
  - 9000：S3 API 访问口（应用与 SDK 走这里）
  - 9001：Web Console（社区版仅浏览，不能管理密钥/策略）
- AccessKey / SecretKey：相当于「账号/密码」，用来让应用或用户访问 MinIO。
- 用户（user）：由 AccessKey/SecretKey 组成的主体，可被授权策略；用户存在于某个实例内，与 alias 本身无关。
- Bucket（存储桶）：对象的逻辑容器，类似「顶层文件夹」，全局唯一命名；桶属于某个实例，不属于具体用户，用户需通过策略被授权访问桶。
- 对象（object）：存储的单个文件，路径形式 `bucket/目录/文件`。
- alias（别名）：在 `mc` 里给某个 MinIO 实例起的本地别名，避免每次写长 URL 和密钥；别名只是客户端的映射层，与用户、桶无直接从属关系。
- Policy（权限策略）：JSON 描述「谁可以对哪些资源做什么动作」，与用户或组绑定后生效。
- 匿名访问：允许未带密钥的请求访问指定桶（常用于公开静态资源）。
- 版本控制/Object Lock：控制对象历史版本与防删锁；如开启，删除需带 `--versions` 或解锁后操作。

## 2. 安装 mc

- macOS（Homebrew）：`brew install minio/stable/mc`
- macOS 官方二进制：
  - Intel: `curl -O https://dl.min.io/client/mc/release/darwin-amd64/mc && chmod +x mc && sudo mv mc /usr/local/bin/`
  - Apple Silicon: `curl -O https://dl.min.io/client/mc/release/darwin-arm64/mc && chmod +x mc && sudo mv mc /usr/local/bin/`
- Linux：`curl -O https://dl.min.io/client/mc/release/linux-amd64/mc && chmod +x mc && sudo mv mc /usr/local/bin/`
- Windows：`curl -O https://dl.min.io/client/mc/release/windows-amd64/mc.exe` 放到 PATH

验证：`mc --version`

## 3. 启动本地 MinIO（示例）

```bash
docker run -d \
  -p 9000:9000 \
  -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin123 \
  minio/minio server /data --console-address ":9001"
```

## 4. 初始化 mc（设置别名）

```bash
mc alias set myminio http://127.0.0.1:9000 minioadmin minioadmin123
# myminio：本地起的别名；后续命令都用它指代这个实例
mc alias list  # 查看所有别名
```

## 5. Bucket（存储桶）操作与含义

- 作用：隔离与组织对象；常用于按业务/环境拆分（如 logs、images、backup）。
- 创建桶：`mc mb myminio/mybucket  # 在实例 myminio 上创建名为 mybucket 的桶`
- 查看桶列表：`mc ls myminio  # 列出 myminio 上的所有桶`
- 删除空桶：`mc rb myminio/mybucket  # remove bucket`
- 删除非空桶：`mc rm -r --force myminio/mybucket && mc rb myminio/mybucket  # 先递归删对象再删桶`
- 删除开启了版本控制的桶：`mc rm -r --versions --force myminio/mybucket  # 连同历史版本一起删`

## 6. 用户 / 密钥（AccessKey/SecretKey）

- 作用：区分不同应用或人员的访问身份，便于最小权限授权与审计。
- 创建用户：`mc admin user add myminio appuser appsecret123  # 创建 AccessKey=appuser, SecretKey=appsecret123`
- 查看用户：`mc admin user list myminio`
- 禁用 / 启用：`mc admin user disable myminio appuser` / `mc admin user enable myminio appuser`
- 删除用户：`mc admin user remove myminio appuser`

## 7. 权限策略（Policy）是什么、怎么用

- 定义：描述动作(Action) 对哪些资源(Resource) 允许/拒绝的 JSON 文档。
- 作用：实现「最小权限」——只给用户访问所需的桶和路径、所需的动作。
- 内置策略：`readonly`（只读）、`writeonly`（只写）、`readwrite`（读写）、`admin`（管理）。
- 常用命令示例：

```bash
mc admin policy list myminio                     # 列出实例内的所有策略
mc admin policy info myminio readwrite           # 查看某个策略详情
mc admin policy attach myminio readwrite --user appuser   # 绑定策略到用户
mc admin policy detach myminio readwrite --user appuser   # 解绑策略
mc admin policy remove myminio mybucket-rw       # 删除自定义策略（需先解绑）
```

### 7.1 自定义策略示例（限定某桶读/写/删）

1. 新建文件 `mybucket-rw.json`：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
      "Resource": ["arn:aws:s3:::mybucket/*"]
    }
  ]
}
```

2. 导入并绑定：

```bash
mc admin policy add myminio mybucket-rw mybucket-rw.json   # 定义策略
mc admin policy attach myminio mybucket-rw --user appuser  # 绑定给 appuser
```

## 8. 匿名 / 公共访问

- 作用：允许未带密钥的请求访问指定桶，常用于公开图片、静态资源。
- 模式：
  - `download`：允许匿名读/下载（最常用）
  - `upload`：允许匿名上传（风险大，慎用）
  - `public`：读写都开放（一般不建议）
  - `none`：关闭匿名
- 命令示例：
  - 开启公开读：`mc anonymous set download myminio/mybucket  # 允许匿名下载`
  - 开启匿名上传：`mc anonymous set upload myminio/mybucket   # 允许匿名上传`
  - 开启完全公开：`mc anonymous set public myminio/mybucket    # 读写都开放`
  - 查看匿名状态：`mc anonymous get myminio/mybucket`
  - 关闭匿名：`mc anonymous set none myminio/mybucket`

## 9. 对象操作（中文命令格式示例）

- 上传本地文件到桶：
  - `mc cp [本地路径] myminio/mybucket/目标路径`
  - 例：`mc cp ./local.txt myminio/mybucket/docs/local.txt  # 上传到 docs/ 目录`
- 从桶下载到本地：
  - `mc cp myminio/mybucket/源路径 [本地路径]`
  - 例：`mc cp myminio/mybucket/docs/local.txt ./downloaded.txt`
- 列出对象：
  - `mc ls myminio/mybucket/目录路径  # 显示目录下对象`
  - 例：`mc ls myminio/mybucket/docs/`
- 递归删除某路径：
  - `mc rm -r --force myminio/mybucket/目录路径`
  - 例：`mc rm -r --force myminio/mybucket/tmp/  # 强制删除 tmp/ 下所有对象`

### 9.1 迁移

1. 配置两个实例

```sh
mc alias set minio-old http://old.example.com:9000 ACCESSKEY1 SECRETKEY1
mc alias set minio-new http://new.example.com:9000 ACCESSKEY2 SECRETKEY2
```

2. 在新实例创建 bucket（一次）

```sh
mc mb minio-new/mybucket
```

3. 开始迁移（核心命令）

```sh
mc mirror minio-old/mybucket minio-new/mybucket
```

## 10. SDK / API 接入（S3 兼容）

关键点：使用标准 S3 SDK，指定 `endpoint_url` 指向 MinIO。

Python 示例（boto3）：

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

其他语言（Java / Go / Node.js）：同样用各自的 S3 SDK，配置 `endpoint_url`、AccessKey/SecretKey 即可。

## 11. 常见问题排查

- UI 找不到密钥管理：社区版控制台仅浏览，管理请用 `mc` 或 API。
- 删除桶失败：确认桶为空；如开版本控制或 Object Lock，用 `mc rm -r --versions --force`。
- 连接失败：检查 9000 端口、Root 用户名密码、Docker 端口映射、防火墙。

## 12. 最佳实践

- 不要让应用使用 root 账户；为每个应用单独创建 AccessKey。
- 一个桶一套最小权限策略；按业务/环境拆分桶。
- 公共读仅限静态公开资源；敏感数据必须走鉴权。
- 生产环境注意：高可用（分布式/网关）、加密（TLS / SSE）、审计与备份。

## 13. 可复制的最小脚本（从零到可用）

```bash
# 1) 安装 mc（以 macOS Homebrew 为例）
brew install minio/stable/mc

# 2) 启动本地 MinIO
docker run -d -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin123 \
  minio/minio server /data --console-address ":9001"

# 3) 配置别名
mc alias set myminio http://127.0.0.1:9000 minioadmin minioadmin123

# 4) 创建桶
mc mb myminio/mybucket

# 5) 创建用户并绑定读写策略
mc admin user add myminio appuser appsecret123
mc admin policy attach myminio readwrite --user appuser

# 6) 上传/下载示例
mc cp ./local.txt myminio/mybucket/docs/local.txt
mc cp myminio/mybucket/docs/local.txt ./downloaded.txt
```
