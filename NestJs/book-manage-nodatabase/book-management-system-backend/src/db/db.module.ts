import { DynamicModule, Module } from '@nestjs/common';
import { DbService } from './db.service';

export interface DbModuleOptions {
  path: string;
}

@Module({
  // controllers: [],
  // providers: [DbService],
})
export class DbModule {
  static register(options: DbModuleOptions): DynamicModule {
    return {
      module: DbModule,
      providers: [
        DbService,
        {
          provide: 'DBOptions',
          useValue: options,
        },
      ],
      exports: [DbService],
    };
  }
}
