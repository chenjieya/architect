import {
  ConsoleLogger,
  Injectable,
  LoggerService,
  LogLevel,
} from '@nestjs/common';
import chalk from 'chalk';
import dayjs from 'dayjs';
import {
  createLogger,
  format,
  transports,
  Logger as WinstonLogger,
} from 'winston';
import 'winston-daily-rotate-file';

// @Injectable()
// export class MyLogger extends ConsoleLogger {
//   error(message: any, stack?: string, context?: string) {
//     message = message + '---- 开发环境dev';
//     super.error(message, stack, context);
//   }
//   log(message: any, context?: string) {
//     message = message + '---- 开发环境dev';
//     super.log(message, context);
//   }
// }

// @Injectable()
// export class MyLogger implements LoggerService {
//   private logger: WinstonLogger;

//   constructor() {
//     this.logger = createLogger({
//       level: 'debug',
//       transports: [new transports.Console()],
//     });
//   }
//   log(message: string, context: string) {
//     this.logger.log('info', message, { context });
//   }
//   info(message: string, context: string) {
//     this.logger.info(message, { context });
//   }
//   error(message: string, context: string) {
//     this.logger.error(message, { context });
//   }
//   warn(message: string, context: string) {
//     this.logger.warn(message, { context });
//   }
//   debug(message: string, context: string) {
//     this.logger.debug(message, { context });
//   }
// }

@Injectable()
export class MyLogger implements LoggerService {
  private logger: WinstonLogger;

  constructor() {
    this.logger = createLogger({
      level: 'debug',
      transports: [
        new transports.Console({
          format: format.combine(
            // 颜色
            format.colorize(),
            // 日志格式
            format.printf(({ context, level, message, timestamp }) => {
              const appStr = chalk.blue('[Nest] ') as string;
              const contextStr = chalk.yellow(
                `[${context as string}]`,
              ) as string;

              return `${appStr} ${timestamp as string} ${level} ${contextStr}: ${message as string}`;
            }),
          ),
        }),
        // 保存到文件
        new transports.DailyRotateFile({
          // 日志文件夹
          dirname: process.cwd() + '/src/logs',
          // 日志文件名 %DATE% 会自动替换为当前日期
          filename: 'app-%DATE%.info.log',
          // 日期格式
          datePattern: 'YYYY-MM-DD',
          // 压缩文档
          zippedArchive: true,
          // 文件最大大小，可以是Bytes、KB、MB、GB
          maxSize: '20M',
          // 最大文件数 ‘7d’ 表示7天
          maxFiles: '7d',
          // 日志格式
          format: format.combine(
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            format.json(),
          ),
          // 日志等级,如果不设置，所有日志将会记录在同一文件中
          level: 'info',
        }),
        new transports.DailyRotateFile({
          dirname: process.cwd() + '/src/logs',
          filename: 'app-%DATE%.error.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20M',
          maxFiles: '14d',
          format: format.combine(
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            format.json(),
          ),
          level: 'error',
        }),
      ],
    });
  }
  log(message: string, context: string) {
    const timestamp = dayjs(Date.now()).format('YYYY-MM-DD HH:mm:ss');
    this.logger.log('info', message, { context, timestamp });
  }
  info(message: string, context: string) {
    const timestamp = dayjs(Date.now()).format('YYYY-MM-DD HH:mm:ss');
    this.logger.info(message, { context, timestamp });
  }
  error(message: string, context: string) {
    const timestamp = dayjs(Date.now()).format('YYYY-MM-DD HH:mm:ss');
    this.logger.error(message, { context, timestamp });
  }
  warn(message: string, context: string) {
    const timestamp = dayjs(Date.now()).format('YYYY-MM-DD HH:mm:ss');
    this.logger.warn(message, { context, timestamp });
  }
  debug(message: string, context: string) {
    const timestamp = dayjs(Date.now()).format('YYYY-MM-DD HH:mm:ss');
    this.logger.debug(message, { context, timestamp });
  }
}
