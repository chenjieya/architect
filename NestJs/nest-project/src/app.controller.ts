import {
  Controller,
  Get,
  Headers,
  Inject,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
// import { AopGuard } from './aop/aop.guard';
import { AuthInterceptor } from './auth.interceptor';
import { from, Observable } from 'rxjs';
import {
  MyCombinedDecorator,
  MyController,
  MyHeaders,
  MyParams,
  MyQuery,
  SetUser,
} from './custom.decorator';
import { CustomGuard } from './custom.guard';
import { MyLogger } from './logger/myLogger';
// import { UserService } from './user/user.service';

// @Controller()
@MyController('', '自定义类装饰器')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Inject('car')
  private car: { name: string; price: number };

  @Inject('random')
  private crateFactory: { random: number; car: any; say: string };

  // 在没有模块进行导出的情况是，是不能进行使用的，即使是在app模块下面
  // @Inject(UserService)
  // private userService: UserService;

  @Inject('OPTIONS')
  private options: Record<string, any>;

  @Inject(MyLogger)
  private readonly logger: MyLogger;

  @Get()
  // 该守卫中包含了内部的Service模块的调用，如果没有导出和注入的情况下是不能进行全局使用的
  // @UseGuards(AopGuard)
  getHello(): string {
    // console.log(this.userService.getUser(), '在不导出的情况下进行测试');
    this.logger.error('产生了错误信息', AppService.name);
    this.logger.log('log测试', AppService.name);
    console.log(this.options);
    return this.appService.getHello();
  }

  @Get('car')
  getCar(): string {
    return this.car.name + ' ' + this.car.price + '元';
  }

  @Get('random')
  getRandom(): any {
    return this.crateFactory;
  }

  @Get('auth')
  @UseInterceptors(AuthInterceptor)
  getAuth(): Observable<string> {
    return from(['hello', 'worldA', 'abc']);
  }

  @Get('custom')
  @SetUser('user', 'admin')
  @UseGuards(CustomGuard)
  custom() {
    return 'Hello Custom Decorator';
  }

  @Get('custom2')
  custom2(@MyHeaders('host') host1: string, @Headers('host') host2: string) {
    console.log(host1, host2);
    return 'Hello Custom Decorator';
  }

  @Get('custom3')
  custom3(@MyQuery('id') id: string) {
    console.log(id);
    return 'Hello Custom Decorator';
  }

  @Get('custom4/:id')
  custom4(@MyParams('id') id: string) {
    console.log(id);
    return 'Hello Custom Decorator';
  }

  @MyCombinedDecorator('custom5', 'user', 'admin')
  custom5() {
    return 'Hello Custom Decorator';
  }
}
