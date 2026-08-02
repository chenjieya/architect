---
author: human
ai_editable: false
updated_by: human
updated: 2026-08-02
---

## 1. Nest CLI 的安装与命令

执行一下命令即可将 Nest CLI 安装为全局工具

```shell
npm i -g @nestjs/cli
```

安装完成之后，执行`nest -h`命令，结果如图：

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251127102621895.png)

Nest 提供了非常丰富的命令：

- nest new：用于创建项目
- nest build：用于构建生成环境代码
- nest start：用于启动本地开发服务
- nest info：用于查看当前项目中的 Nest 包信息
- nest add：用于添加官方插件或者第三方模块
- nest generate：用于生成各种模块代码，比如 Module、Controller、Service、Pipe、Middleware 等

同时，命令也支持别名，比如`nest n`、`nest i`、`nest g`

## 2. 创建项目

创建项目可以直接使用 `nest new` 命令，当然我们也可以通过`-h`查看相关参数

```shell
nest new -h
```

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251127102702519.png)

- `--skip-git`和`--skip-install`：用于跳过 Git 初始化和 npm 包安装步骤
- `--package-manager`：指定使用的包管理器(npm/yarn/**pnpm**)
- `--language`：使用 TS 还是 JS 进行编写代码，默认使用 TS
- `--collection`：用于指定工作流集合，默认是`@nestjs/schematics`，用于创建模块，控制器，服务等等，与`nest generate`命令相关。通常默认值即可。
- `--strict`：用于指定 TS 是否以严格模式运行

直接执行`nest n [工程名]`即可帮你创建项目，不过会提示你使用什么包管理器

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251127102721632.png)

当然，也可以加上参数

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251127102737424.png)

CLI 直接创建的项目模板：

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251127102751201.png)

我们也可以使用`nest generate`单独创建项目需要的内容，比如模块，控制器，服务等等

## 3. 生成指定的代码片段

执行`nest generate -h`命令，可以查看相关内容

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251127102838120.png)

- --flat 和 --no-flat 是指定是否生成对应目录的：
  ![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251127103902000.png)

- --spec 和 --no-spec 是指定是否生成测试文件：
  ![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251127103935936.png)

- --skip-import 是指定不在 AppModule 里引入：
  ![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251127103959552.png)
  也就是不生成这部分代码：
  ![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251127104024621.png)

- 至于 --project，这是指定生成代码在哪个子项目的，等之后用到 monorepo 项目的时候再说。

你可以通过下面的命令，逐个生成 Controller、Service 或者 Module

```typescript
nest g controller 控制器名称
```

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251127103019264.png)

```shell
nest g service 服务名称
```

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251127103040389.png)

```typescript
nest g module 模块名称
```

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251127103051743.png)

其实，module，service 和 controller 是有关系，只是这其中的关系我们后面再慢慢解释，这涉及到后端架构方面的处理，反正无论如何这几个我们都要创建，那一个个去处理太麻烦，所以我们可以直接使用`nest generate resource`命令一键生成后端需要的`CRUD`模板代码

```shell
nest g resource person
```

注意需要选择 REST 风格的 API

![](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251127103103943.png)

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251127103131598.png)

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251127103145657.png)

其中 dto 和 entity 是 CRUD 相关需要的代码，我们这里暂时不需要理会他们，后面我们会慢慢讲解

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251127103159177.png)

`.spec.ts`是单元测试文件，我们可以在创建的时候，通过参数`--no-spec`参数表明不生成测试文件，比如：

```typescript
nest g resource order --no-spec
```

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251127102818205.png)

## 4. 一些格式报错问题

工程创建好之后，有些代码会报错。

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251127103216575.png)

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251127103229913.png)

其实这并不是错误，而是 eslint 与 prettier 配置的问题，如果你不想这些红色波浪线错误困扰你，可以直接配置`.eslintrc.js`屏蔽掉这些错误：

```typescript
module.exports = {
  // ......
  rules: {
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "prettier/prettier": [
      "warn",
      {
        endOfLine: "auto",
      },
    ],
  },
};
```

## 5. 构建应用

可以通过`nest build`命令来构建应用

默认情况下，Nest 使用 tsc 进行编译，直接运行`nest build`命令相关如下：

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251127103244685.png)

如果我们希望编译并打包，可以直接切换使用`webpack`进行打包，只需要使用参数 `-b webpack`

当然，相关的参数，一样可以使用`nest build -h`来进行查看

```typescript
nest build -b webpack
```

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251127103258196.png)

- --wepback 和 --tsc 是指定用什么编译，默认是 tsc 编译，也可以切换成 webpack
  这是 tsc 的编译产物：
  ![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251127114239804.png)

这是 webpack 的编译产物：

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251127114300363.png)

> tsc 不做打包、webpack 会做打包，两种方式都可以。
> node 模块本来就不需要打包，但是打包成单模块能提升加载的性能。

- --watch 是监听文件变动，自动 build 的。
  但是 --watch 默认只是监听 ts、js 文件，加上 --watchAssets 会连别的文件一同监听变化，并输出到 dist 目录，比如 md、yml 等文件。

- --path 是指定 tsc 配置文件的路径的。

- 那 --config 是指定什么配置文件呢？是 nest cli 的配置文件。

## 6. nest-cli.json

[https://json.schemastore.org/nest-cli](https://json.schemastore.org/nest-cli)

每次执行都需要加上一些参数，这样太麻烦了，nest 给我们提供了`nest-cli.json`配置文件，我们可以在这个配置文件中，直接配置上我们经常需要使用的参数，比如：

```typescript
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "generateOptions": {
    "spec": false, // 是否生成测试文件
    "flat": false // 是否扁平化直接生成文件在src目录下(默认为true，会生成对应的目录结构)
  },
  "compilerOptions": {
    "deleteOutDir": true, // 是否删除输出目录
    "webpack": true // 是否使用webpack
  }
}
```

## 7. 简单测试

在 main.ts 文件中修改端口号，比如为 8088

```typescript
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(8088);
}
bootstrap();
```

为了返回数据方便，先定义一个实体类，比如`admin.entity.ts`

```typescript
export class Admin {
  constructor(
    private id: string,
    private name: string,
    private password: string
  ) {
    this.id = id;
    this.name = name;
    this.password = password;
  }
}
```

controller 中处理

```typescript
import { Controller, Get, Param } from "@nestjs/common";
import { AppService } from "./app.service";
import { Admin } from "./admin.entity";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getAll(): Admin[] {
    return this.appService.getAll();
  }

  @Get(":id")
  getOne(@Param("id") id: string): Admin {
    return this.appService.getOne(id);
  }
}
```

service 中处理

```typescript
import { Injectable } from "@nestjs/common";
import { Admin } from "./admin.entity";

@Injectable()
export class AppService {
  getAll(): Admin[] {
    return [
      new Admin("1", "John Doe", "password"),
      new Admin("2", "Jane Doe", "password"),
      new Admin("3", "Jim Doe", "password"),
    ];
  }

  getOne(id: string): Admin {
    return new Admin("1", "John Doe", "password");
  }
}
```

通过命令`nest start -w`启动后端服务

我们可以直接使用`Apifox`，或者`postman`直接测试端口

![image.png](https://picgo-1300696809.cos.ap-beijing.myqcloud.com/20251127103315668.png)
