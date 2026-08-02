资源也是 MCP Server 向客户端应用提供信息的一种形式。

例如：

- File contents（文件内容）

  比如本地的 `.txt`、`.md`、`.js`、`.json` 文件

- Database records（数据库记录）

  比如 SQL 查询结果或某个表格的内容

- Screenshots and images（截图和图像）

  图像类资源

## 1. URI

URI 英语全称为 Uniform Resource Identifier，中文是“统一资源标识符”，用于互联网上某个资源的唯一标识。

URI 的格式为：

```
[protocol]://[host]/[path]
```

例如：

- `file:///home/user/documents/report.pdf`：文件资源，这个例子里面没有 host
- `postgres://database/customers/schema`：是一个数据库资源
- `screen://localhost/display1`：屏幕资源

在 MCP 协议中，**不强制 URI 规则**，允许 Server 自定义。

- `notebook://cell/123`
- `log://app/service/error`
- `chat://conversation/abc123`

回头在 MCP Server 中，所有的资源都会有一个 URI.

## 2. 资源类型

MCP 中的资源分为两类：Text resources 和 Binary resources

### 2.1 文本资源

文本资源是用 **UTF-8 编码**的纯文本数据，适合用来展示、编辑、分析。

- **Source code**（源代码）：如 `.js`、`.ts`、`.py`、`.cpp` 等文件的内容，可以作为上下文供 LLM 阅读和理解。
- **Configuration files**（配置文件）： 如 `.env`、`config.yaml`、`tsconfig.json` 等。
- **Log files**（日志文件）：包括运行日志、错误日志，供分析或总结。
- **JSON/XML data**：结构化的文本格式，广泛用于数据交换。
- **Plain text**（纯文本）：普通的 `.txt` 文件或文档片段。

### 2.2 二进制资源

二进制资源是原始的二进制数据，**必须**通过 **base64 编码**传输。

- **Images**（图像）：如 PNG、JPG、SVG 等，可用于截图、照片识别等任务。

- **PDFs**：常用于展示格式化文档或技术手册。

- **Audio files**（音频）：如 MP3、WAV，用于语音识别、分析等。

- **Video files**（视频）：如 MP4、WEBM，可用于视频摘要或分析。

- **Other non-text formats**（其它非文本格式）：如 `.zip` 压缩包、`.docx` 文档、`.exe` 文件等。

## 3. 发现资源

MCP 提供了两种发现资源的方式：

1. 直接资源
2. 资源模板

### 3.1 直接资源

服务器直接暴露一组固定资源，通过 JSON-RPC 方法 `resources/list` 提供给客户端。

工具：`tools/list`

每个资源包含字段如下：

```json
{
  uri: string;         // 资源的唯一 URI（例如 file:///xxx）
  name: string;        // 人类可读的名称
  description?: string;// 可选描述，解释用途或内容
  mimeType?: string;   // MIME 类型，如 text/plain, image/png
  size?: number;       // 文件大小（单位：字节）
}
```

例如：

```json
{
  "uri": "file:///logs/build.log",
  "name": "构建日志",
  "description": "包含最近一次构建的所有输出信息",
  "mimeType": "text/plain",
  "size": 18423
}
```

### 3.2 资源模板

服务器还可以提供一组 URI 模板，供客户端**根据参数动态构造 URI**（例如选择城市、文件名等）。

这些模板符合 [RFC 6570](https://datatracker.ietf.org/doc/html/rfc6570) 的格式，例如：

- `file:///project/src/{filename}`
- `screen://localhost/{displayId}`

> [!tip]
>
> RFC 6570 是一份由 IETF 制定的标准文档，它定义了一种 URI 模板语法，用于通过填入变量值来构建动态 URI。

每个模板的结构如下：

```json
{
  uriTemplate: string; // 可变 URI 模板（如 file:///{path}）
  name: string;        // 模板的说明名称
  description?: string;// 模板描述
  mimeType?: string;   // 匹配资源的 MIME 类型（适用于所有匹配项）
}
```

例如：

```json
{
  "uriTemplate": "file:///home/user/{filename}",
  "name": "用户目录下的文件",
  "description": "允许读取任意用户目录下的文件名",
  "mimeType": "text/plain"
}
```

**实践**

为 MCP Server 注册资源模板。

setRequestHandler

| 功能         | Schema 名                            | 结构                                            |
| ------------ | ------------------------------------ | ----------------------------------------------- |
| 读取资源     | `ReadResourceRequestSchema`          | `{ method: "resources/read", params: { uri } }` |
| 列出资源     | `ListResourcesRequestSchema`         | `{ method: "resources/list", params: {} }`      |
| 列出资源模板 | `ListResourceTemplatesRequestSchema` | `{ method: "resources/templates", params: {} }` |

## 4. 读取资源

客户端通过发送 JSON-RPC 请求：

方法名为 `resources/read`，在 params 中写上资源的 URI

```json
{
  "method": "resources/read",
  "params": {
    "uri": "file:///logs/error.log"
  }
}
```

服务器返回一个 JSON 对象，包含一个 `contents` 数组，每个数组元素表示一个资源内容对象，结构如下：

```json
{
  contents: [
    {
      uri: string;          // 必填，资源的唯一 URI
      mimeType?: string;    // 可选，MIME 类型，如 text/plain、image/png

      // 以下两者二选一
      text?: string;        // 文本资源内容（UTF-8 编码）
      blob?: string;        // 二进制资源内容（Base64 编码）
    }
  ]
}
```

MCP 支持 **一次 `resources/read` 返回多个资源内容**。

比如：读取一个目录：`file:///project/src/`，返回值可能是里面多个文件的内容（如多个 `.ts` 文件）

**实践**

为 MCP 服务器注册资源上下文。

调试工具：

```bash
npx @modelcontextprotocol/inspector
```

在线base64图片预览：https://jaredwinick.github.io/base64-image-viewer/

```
data:image/png;base64,<base64编码>
```
