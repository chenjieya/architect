---
author: human
ai_editable: false
updated_by: human
updated: 2026-08-02
---

在前后端分离的开发模式下，**接口文档**是前后端协作中非常重要的一环。

常见的痛点包括：

- 接口写完后还要**手动写一份接口文档**
- 接口一旦修改，就要**同步修改文档**
- 文档和真实接口**经常不一致**
- 参数、返回结构复杂时，维护成本极高

那么，有没有一种方式，可以**根据代码自动生成接口文档**，并且还能直接在线调试接口呢？

答案就是：**Swagger（OpenAPI）**。

在 NestJS 中，官方已经为我们提供了非常完善的 Swagger 支持，这篇文章将通过一个完整示例，带你从 0 到 1 掌握 **Swagger 在 NestJS 中的使用方式**。

---

## 1. Swagger 是什么？

Swagger 是 **OpenAPI 规范**的一种实现：

- 用统一的格式描述接口
- 自动生成可视化接口文档
- 支持在线调试接口
- 支持多种认证方式（JWT、Cookie、Basic Auth）

在 NestJS 中，我们通过 `@nestjs/swagger` 这个包来集成 Swagger。

---

## 2. 创建 NestJS 项目并安装 Swagger

### 2.1 新建项目

```bash
nest new swagger-test -p npm
```

### 2.2 安装 Swagger 相关依赖

```bash
npm install --save @nestjs/swagger
```

---

## 3. 在 main.ts 中启用 Swagger

在 `main.ts` 中添加如下代码：

```ts
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";

const config = new DocumentBuilder()
  .setTitle("Test example")
  .setDescription("The API description")
  .setVersion("1.0")
  .addTag("test")
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup("doc", app, document);
```

### 3.1 这段代码做了什么？

1. **DocumentBuilder**

   - 用于构建 Swagger 文档的基础配置
   - 包括标题、描述、版本、标签等

2. **SwaggerModule.createDocument**

   - 根据应用和配置生成 OpenAPI 文档对象

3. **SwaggerModule.setup**

   - 指定 Swagger UI 的访问路径（这里是 `/doc`）

---

## 4. 访问 Swagger 文档

启动项目：

```bash
npm run start:dev
```

浏览器访问：

```
http://localhost:3000/doc
```

你将看到一个可视化的 Swagger API 文档页面，并且已经自动扫描出了项目中的接口。

---

## 5. 接口未标注时的问题

我们先写几个简单接口：

```ts
@Get('aaa')
aaa(@Query('a1') a1, @Query('a2') a2) {
  return 'aaa success';
}

@Get('bbb/:id')
bbb(@Param('id') id) {
  return 'bbb success';
}

@Post('ccc')
ccc(@Body('ccc') ccc) {
  return 'ccc success';
}
```

Swagger 可以识别这些接口，但会存在几个问题：

- ❌ 没有接口说明
- ❌ 参数没有描述
- ❌ 返回值结构不清晰

这时就需要 **Swagger 装饰器** 来补充信息。

---

## 6. 使用 Swagger 装饰器完善接口文档

### 6.1 描述接口：@ApiOperation

```ts
@ApiOperation({
  summary: '测试 aaa',
  description: 'aaa 描述',
})
```

### 6.2 描述返回值：@ApiResponse

```ts
@ApiResponse({
  status: HttpStatus.OK,
  description: 'aaa 成功',
  type: String,
})
```

> 一个接口可以声明多个 `@ApiResponse`，用于描述不同状态码的返回结果。

---

## 7. 七、描述参数（Query / Param / Body）

### 7.1 Query 参数：@ApiQuery

```ts
@ApiQuery({
  name: 'a1',
  type: String,
  description: 'a1 param',
  required: false,
  example: '1111',
})
@ApiQuery({
  name: 'a2',
  type: Number,
  description: 'a2 param',
  required: true,
  example: 2222,
})
```

---

### 7.2 Path 参数：@ApiParam

```ts
@ApiParam({
  name: 'id',
  description: 'ID',
  required: true,
  example: 222,
})
```

---

### 7.3 Body 参数：@ApiBody（通常可省略）

对于复杂请求体，推荐使用 **DTO**。

---

## 8. DTO 与 VO 的最佳实践

### 8.1 DTO（Data Transfer Object）

用于**接收请求参数**：

```ts
export class CccDto {
  @ApiProperty({
    enum: ["a1", "a2", "a3"],
    maxLength: 30,
  })
  aaa: string;

  @ApiPropertyOptional({
    minimum: 40,
    maximum: 60,
    default: 50,
  })
  bbb: number;

  @ApiProperty()
  ccc: string[];
}
```

---

### 8.2 VO（View Object）

用于**返回给前端的数据结构**：

```ts
export class CccVo {
  @ApiProperty()
  aaa: number;

  @ApiProperty()
  bbb: number;
}
```

---

### 8.3 Controller 使用方式

```ts
@Post('ccc')
@ApiOperation({ summary: '测试 ccc' })
@ApiResponse({
  status: HttpStatus.OK,
  description: 'ccc 成功',
  type: CccVo,
})
@ApiBody({ type: CccDto })
ccc(@Body() dto: CccDto) {
  const vo = new CccVo();
  vo.aaa = 111;
  vo.bbb = 222;
  return vo;
}
```

Swagger 会自动为 DTO / VO 生成 Schema。

---

## 9. 接口分组：@ApiTags

### 9.1 Controller 级别分组

```ts
@ApiTags('xxx')
@Controller('xxx')
```

### 9.2 接口级别分组

```ts
@ApiTags('xxx-get')
@Get('aaa')
```

接口多的时候，**分组是非常必要的**。

---

## 10. 接口认证（JWT / Cookie / Basic Auth）

### 10.1 接口上标记认证方式

```ts
@ApiBearerAuth()
@ApiCookieAuth()
@ApiBasicAuth()
```

---

### 10.2 在 main.ts 中声明认证方式

```ts
.addBasicAuth({
  type: 'http',
  description: '用户名 + 密码',
})
.addCookieAuth('sid', {
  type: 'apiKey',
  description: '基于 cookie 的认证',
})
.addBearerAuth({
  type: 'http',
  description: '基于 jwt 的认证',
})
```

Swagger UI 会自动显示 🔒 图标，并在请求时携带对应认证信息。

---

## 11. OpenAPI JSON 导出

Swagger 实际上是 **OpenAPI 标准**的实现。

访问：

```
http://localhost:3000/doc-json
```

即可拿到完整的 OpenAPI JSON 描述。

这个 JSON 可以：

- 导入 Apifox / YApi / Postman
- 用于前端自动生成 API SDK
- 用于接口 Mock

---

## 12. 总结

### 12.1 Swagger 能解决什么问题？

- ✅ 自动生成接口文档
- ✅ 接口即文档，永远同步
- ✅ 在线调试接口
- ✅ 清晰的参数 & 返回结构
- ✅ 支持多种认证方式

### 12.2 常用 Swagger 装饰器一览

- `@ApiOperation`：接口说明
- `@ApiResponse`：响应描述
- `@ApiQuery`：Query 参数
- `@ApiParam`：Path 参数
- `@ApiBody`：Body 参数
- `@ApiProperty` / `@ApiPropertyOptional`：DTO / VO 字段
- `@ApiTags`：接口分组
- `@ApiBearerAuth`：JWT 认证
- `@ApiCookieAuth`：Cookie 认证
- `@ApiBasicAuth`：Basic 认证

---

**在绝大多数公司中，接口文档几乎都是通过 Swagger 自动生成的。**  
如果还在手动维护接口文档，那维护成本和出错概率都会非常高。
