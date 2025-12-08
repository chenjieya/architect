import { Inject, Injectable } from '@nestjs/common';
import type { DbModuleOptions } from './db.module';
import { access, readFile, writeFile } from 'fs/promises';

@Injectable()
export class DbService {
  @Inject('DBOptions')
  private readonly userDb: DbModuleOptions;

  async readFile() {
    const filePath = this.userDb.path;

    try {
      // 检查文件是否能正常访问
      await access(filePath);
    } catch {
      // 文件不能正常访问
      return [];
    }

    // 读取文件
    const str = await readFile(filePath, {
      encoding: 'utf-8',
    });

    if (!str) {
      return [];
    }

    return JSON.parse(str);
  }

  async writeFile(fileContent: Record<string, any>) {
    // 写入文件
    await writeFile(this.userDb.path, JSON.stringify(fileContent || []), {
      encoding: 'utf-8',
    });
  }
}
