---
author: human
ai_editable: false
updated_by: human
updated: 2026-08-02
---

## 1. 引言

在现代 Web 应用开发中，定时任务是一个不可或缺的功能。无论是定时数据清理、报表生成、缓存更新还是第三方 API 的定期同步，都需要可靠的任务调度机制。NestJS 作为一款强大的 Node.js 框架，为我们提供了优雅的定时任务解决方案。

本文将深入探讨 NestJS 中定时任务的实现方式，从基础使用到高级特性，帮助你构建健壮可靠的定时任务系统。

## 2. NestJS 定时任务模块概述

### 2.1 为什么需要定时任务模块？

在传统 Node.js 应用中，我们可能会使用`setTimeout`、`setInterval`或`node-cron`等库来实现定时任务。但这些方案存在以下问题：

- 缺乏统一的代码组织和维护方式
- 难以与依赖注入系统集成
- 缺少声明式的任务管理
- 缺乏错误处理机制

NestJS 的`@nestjs/schedule`包正是为了解决这些问题而生。

### 2.2 安装与配置

首先安装必要的依赖：

```bash
npm install --save @nestjs/schedule
npm install --save-dev @types/cron
```

在应用模块中注册：

```typescript
// app.module.ts
import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";

@Module({
  imports: [ScheduleModule.forRoot()],
})
export class AppModule {}
```

也可以通过异步方式配置：

```typescript
@Module({
  imports: [
    ScheduleModule.forRootAsync({
      useFactory: () => ({
        // 可选的配置项
      }),
    }),
  ],
})
export class AppModule {}
```

## 3. 三种定时任务类型详解

### 3.1 Cron 表达式任务

Cron 表达式是最灵活和强大的定时任务方式，支持标准的 Unix cron 语法。

#### 3.1.1 基本用法

```typescript
import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  @Cron("45 * * * * *")
  handleCron() {
    this.logger.debug("每分钟的第45秒执行");
  }
}
```

#### 3.1.2 Cron 表达式详解

| 字段 | 允许值          | 允许的特殊字符 |
| ---- | --------------- | -------------- |
| 秒   | 0-59            | , - \* /       |
| 分   | 0-59            | , - \* /       |
| 小时 | 0-23            | , - \* /       |
| 日期 | 1-31            | , - \* ? / L W |
| 月份 | 1-12 或 JAN-DEC | , - \* /       |
| 星期 | 0-7 或 SUN-SAT  | , - \* ? / L # |

**常用示例：**

```typescript
export class TasksService {
  @Cron("0 */10 * * * *") // 每10分钟执行
  everyTenMinutes() {}

  @Cron("0 30 9 * * *") // 每天9:30执行
  dailyAtNineThirty() {}

  @Cron("0 0 18 * * 1-5") // 工作日18:00执行
  weekdaysAtSixPM() {}

  @Cron("0 0 8 1 * *") // 每月1号8:00执行
  firstDayOfMonth() {}
}
```

### 3.2 间隔任务 (Interval)

适合需要固定间隔执行的任务。

```typescript
import { Interval } from "@nestjs/schedule";

@Injectable()
export class TasksService {
  @Interval(10000) // 每10秒执行
  handleInterval() {
    this.logger.debug("间隔任务执行");
  }

  @Interval("cleanup", 30000) // 带名称的任务，每30秒执行
  handleNamedInterval() {
    this.logger.debug("带名称的间隔任务");
  }
}
```

### 3.3 超时任务 (Timeout)

适合需要延迟执行的单次任务。

```typescript
import { Timeout } from "@nestjs/schedule";

@Injectable()
export class TasksService {
  @Timeout(5000) // 5秒后执行一次
  handleTimeout() {
    this.logger.debug("超时任务执行");
  }

  @Timeout("initialization", 10000) // 带名称的任务
  handleInitialization() {
    this.logger.debug("初始化任务执行");
  }
}
```

## 4. 动态定时任务管理

### 4.1 使用 SchedulerRegistry

有时我们需要动态控制任务的启停，这时可以使用`SchedulerRegistry`。

```typescript
import { Injectable, Logger } from "@nestjs/common";
import { SchedulerRegistry } from "@nestjs/schedule";
import { CronJob } from "cron";

@Injectable()
export class DynamicTasksService {
  private readonly logger = new Logger(DynamicTasksService.name);

  constructor(private schedulerRegistry: SchedulerRegistry) {}

  addCronJob(name: string, cronExpression: string) {
    const job = new CronJob(cronExpression, () => {
      this.logger.log(`动态任务 ${name} 执行`);
    });

    this.schedulerRegistry.addCronJob(name, job);
    job.start();

    this.logger.log(`任务 ${name} 已添加，表达式: ${cronExpression}`);
  }

  deleteCronJob(name: string) {
    this.schedulerRegistry.deleteCronJob(name);
    this.logger.log(`任务 ${name} 已删除`);
  }

  getCronJobs() {
    const jobs = this.schedulerRegistry.getCronJobs();
    jobs.forEach((job, name) => {
      let next;
      try {
        next = job.nextDate().toDate();
      } catch (e) {
        next = "error: 任务已停止";
      }
      this.logger.log(`任务: ${name} -> 下次执行时间: ${next}`);
    });
  }

  stopCronJob(name: string) {
    const job = this.schedulerRegistry.getCronJob(name);
    job.stop();
    this.logger.log(`任务 ${name} 已停止`);
  }

  startCronJob(name: string) {
    const job = this.schedulerRegistry.getCronJob(name);
    job.start();
    this.logger.log(`任务 ${name} 已启动`);
  }
}
```

### 4.2 控制器集成示例

创建 API 来管理定时任务：

```typescript
// tasks.controller.ts
import { Controller, Post, Delete, Get, Body, Param } from "@nestjs/common";
import { DynamicTasksService } from "./dynamic-tasks.service";

@Controller("tasks")
export class TasksController {
  constructor(private readonly tasksService: DynamicTasksService) {}

  @Post("cron")
  createCronJob(@Body() body: { name: string; expression: string }) {
    return this.tasksService.addCronJob(body.name, body.expression);
  }

  @Delete("cron/:name")
  deleteCronJob(@Param("name") name: string) {
    return this.tasksService.deleteCronJob(name);
  }

  @Get("cron")
  getCronJobs() {
    return this.tasksService.getCronJobs();
  }

  @Post("cron/:name/stop")
  stopCronJob(@Param("name") name: string) {
    return this.tasksService.stopCronJob(name);
  }

  @Post("cron/:name/start")
  startCronJob(@Param("name") name: string) {
    return this.tasksService.startCronJob(name);
  }
}
```

## 5. 高级特性与最佳实践

### 5.1 任务锁定与集群安全

在生产环境中，当应用运行在多个实例时，需要防止任务重复执行。

**使用 Redis 分布式锁：**

```typescript
import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import Redis from "ioredis";

@Injectable()
export class ClusterSafeTasksService {
  private readonly redis = new Redis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
  });

  @Cron(CronExpression.EVERY_MINUTE)
  async clusterSafeTask() {
    const lockKey = "task:report-generation:lock";
    const lockValue = process.pid.toString();

    // 尝试获取分布式锁，有效期55秒
    const acquired = await this.redis.set(lockKey, lockValue, "EX", 55, "NX");

    if (acquired) {
      try {
        await this.generateReport();
      } finally {
        // 确保只释放自己的锁
        const currentValue = await this.redis.get(lockKey);
        if (currentValue === lockValue) {
          await this.redis.del(lockKey);
        }
      }
    }
  }

  private async generateReport() {
    // 生成报表的逻辑
  }
}
```

### 5.2 任务重试与错误处理

```typescript
import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { retry } from "rxjs/operators";

@Injectable()
export class ReliableTasksService {
  private readonly logger = new Logger(ReliableTasksService.name);

  @Cron("0 */5 * * * *") // 每5分钟执行
  async reliableTask() {
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.processTask();
        this.logger.log("任务执行成功");
        break;
      } catch (error) {
        this.logger.error(
          `任务执行失败，尝试 ${attempt}/${maxRetries}`,
          error.stack
        );

        if (attempt === maxRetries) {
          await this.notifyFailure(error);
        } else {
          await this.delay(Math.pow(2, attempt) * 1000); // 指数退避
        }
      }
    }
  }

  private async processTask() {
    // 可能失败的任务逻辑
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async notifyFailure(error: Error) {
    // 通知管理员
  }
}
```

### 5.3 性能监控与日志

```typescript
import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";

@Injectable()
export class MonitoredTasksService {
  private readonly logger = new Logger(MonitoredTasksService.name);

  @Cron("0 */15 * * * *")
  async monitoredTask() {
    const startTime = Date.now();

    try {
      this.logger.log("任务开始执行");

      // 执行实际任务
      await this.performTask();

      const duration = Date.now() - startTime;
      this.logger.log(`任务执行完成，耗时: ${duration}ms`);

      // 记录性能指标
      await this.recordMetrics("monitoredTask", duration, true);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`任务执行失败，耗时: ${duration}ms`, error.stack);

      await this.recordMetrics("monitoredTask", duration, false);
      throw error;
    }
  }

  private async performTask() {
    // 任务逻辑
  }

  private async recordMetrics(
    taskName: string,
    duration: number,
    success: boolean
  ) {
    // 记录到监控系统
  }
}
```

## 6. 完整示例：数据备份系统

让我们构建一个完整的数据备份系统：

```typescript
// backup.service.ts
import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { SchedulerRegistry } from "@nestjs/schedule";
import * as fs from "fs/promises";
import * as path from "path";
import { DatabaseService } from "../database/database.service";
import { StorageService } from "../storage/storage.service";

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  private readonly backupDir = "backups";

  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private databaseService: DatabaseService,
    private storageService: StorageService
  ) {
    this.ensureBackupDirectory();
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async dailyBackup() {
    await this.performBackup("daily");
  }

  @Cron(CronExpression.EVERY_WEEK)
  async weeklyBackup() {
    await this.performBackup("weekly");
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async monthlyBackup() {
    await this.performBackup("monthly");
  }

  private async ensureBackupDirectory() {
    try {
      await fs.access(this.backupDir);
    } catch {
      await fs.mkdir(this.backupDir, { recursive: true });
    }
  }

  private async performBackup(type: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `${type}-backup-${timestamp}.sql`;
    const filepath = path.join(this.backupDir, filename);

    try {
      this.logger.log(`开始${type}备份: ${filename}`);

      // 1. 导出数据库
      const data = await this.databaseService.export();
      await fs.writeFile(filepath, data);

      // 2. 上传到云存储
      const cloudPath = await this.storageService.upload(
        filepath,
        `backups/${type}/${filename}`
      );

      // 3. 清理旧备份
      await this.cleanOldBackups(type);

      this.logger.log(`${type}备份完成: ${cloudPath}`);

      // 4. 发送通知
      await this.sendNotification({
        type,
        filename,
        cloudPath,
        size: data.length,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error(`${type}备份失败`, error.stack);
      await this.sendErrorNotification(type, error);
      throw error;
    }
  }

  private async cleanOldBackups(type: string) {
    const files = await fs.readdir(this.backupDir);
    const backups = files
      .filter((f) => f.startsWith(`${type}-backup-`))
      .sort()
      .reverse();

    // 保留最新的10个备份
    const toDelete = backups.slice(10);

    for (const file of toDelete) {
      await fs.unlink(path.join(this.backupDir, file));
      this.logger.log(`删除旧备份: ${file}`);
    }
  }

  private async sendNotification(details: any) {
    // 发送邮件、Slack等通知
  }

  private async sendErrorNotification(type: string, error: Error) {
    // 发送错误通知
  }

  // 动态添加备份任务
  addCustomBackupSchedule(name: string, cronExpression: string) {
    // 实现动态任务添加
  }
}
```

## 7. 测试策略

### 7.1 单元测试

```typescript
// tasks.service.spec.ts
import { Test, TestingModule } from "@nestjs/testing";
import { TasksService } from "./tasks.service";
import { SchedulerRegistry } from "@nestjs/schedule";

describe("TasksService", () => {
  let service: TasksService;
  let schedulerRegistry: SchedulerRegistry;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: SchedulerRegistry,
          useValue: {
            addCronJob: jest.fn(),
            deleteCronJob: jest.fn(),
            getCronJobs: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    schedulerRegistry = module.get<SchedulerRegistry>(SchedulerRegistry);
  });

  it("应该被定义", () => {
    expect(service).toBeDefined();
  });

  describe("定时任务", () => {
    it("应该正确处理Cron任务", () => {
      // 测试任务逻辑
    });

    it("应该处理任务执行错误", async () => {
      // 测试错误处理
    });
  });
});
```

### 7.2 E2E 测试

```typescript
// tasks.e2e-spec.ts
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app.module";

describe("定时任务API (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("/tasks/cron (POST)", () => {
    it("应该成功创建定时任务", () => {
      return request(app.getHttpServer())
        .post("/tasks/cron")
        .send({
          name: "test-job",
          expression: "* * * * * *",
        })
        .expect(201);
    });
  });
});
```

## 8. 常见问题与解决方案

### 8.1 任务执行时间过长

**问题：** 任务执行时间超过间隔时间，导致任务重叠。

**解决方案：**

```typescript
@Injectable()
export class NonOverlappingTaskService {
  private isRunning = false;

  @Cron("*/30 * * * * *")
  async nonOverlappingTask() {
    if (this.isRunning) {
      this.logger.warn("上一个任务仍在执行，跳过本次执行");
      return;
    }

    this.isRunning = true;
    try {
      await this.longRunningTask();
    } finally {
      this.isRunning = false;
    }
  }
}
```

### 8.2 时区问题

```typescript
@Injectable()
export class TimezoneAwareService {
  @Cron("0 30 9 * * *", {
    timeZone: "Asia/Shanghai", // 指定时区
  })
  handleTimezone() {
    // 每天北京时间9:30执行
  }
}
```

### 8.3 任务依赖管理

```typescript
@Injectable()
export class DependentTasksService {
  constructor(
    private taskA: TaskAService,
    private taskB: TaskBService,
    private taskC: TaskCService
  ) {}

  @Cron("0 0 2 * * *")
  async orchestrateTasks() {
    // 顺序执行依赖任务
    await this.taskA.execute();
    await this.taskB.execute();
    await this.taskC.execute();
  }
}
```

## 9. 总结

NestJS 的定时任务模块提供了强大而灵活的任务调度能力。通过本文的详细介绍，你应该能够：

1. **理解三种定时任务类型**：Cron、Interval、Timeout 的区别和适用场景
2. **掌握动态任务管理**：通过 API 动态创建、删除、启停任务
3. **实现生产级特性**：分布式锁、错误重试、性能监控等
4. **构建完整应用**：如数据备份系统等实际案例

### 9.1 最佳实践建议：

- **日志记录**：为所有任务添加详细的日志记录
- **错误处理**：实现完善的错误处理和通知机制
- **资源管理**：注意内存和连接泄漏问题
- **监控告警**：集成到现有的监控系统中
- **文档化**：为所有任务编写清晰的文档

NestJS 的定时任务模块虽然功能强大，但在实际使用中还需要根据具体业务场景进行合理的设计和规划。希望本文能帮助你在项目中更好地使用定时任务功能！

---

**扩展资源：**

- [NestJS 官方文档 - 定时任务](https://docs.nestjs.com/techniques/task-scheduling)
- [cron 表达式生成器](https://crontab.guru/)
- [node-cron 文档](https://github.com/kelektiv/node-cron)
