import { DynamicModule, Module } from '@nestjs/common';
import { DyModuleRegisterService } from './dy-module-register.service';
import { DyModuleRegisterController } from './dy-module-register.controller';

@Module({
  controllers: [DyModuleRegisterController],
  providers: [DyModuleRegisterService],
})
export class DyModuleRegisterModule {
  static register(options: Record<string, any>): DynamicModule {
    return {
      module: DyModuleRegisterModule,
      controllers: [DyModuleRegisterController],
      providers: [
        DyModuleRegisterService,
        {
          provide: 'OPTIONS',
          useValue: options,
        },
      ],
      exports: [DyModuleRegisterService, 'OPTIONS'],
    };
  }
}
