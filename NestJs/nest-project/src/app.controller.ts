import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
// import { UserService } from './user/user.service';

@Controller()
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

  @Get()
  getHello(): string {
    // console.log(this.userService.getUser(), '在不导出的情况下进行测试');
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
}
