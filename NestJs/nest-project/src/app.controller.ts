import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Inject('car')
  private car: { name: string; price: number };

  @Inject('random')
  private crateFactory: { random: number; car: any; say: string };

  @Get()
  getHello(): string {
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
