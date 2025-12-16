import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { randomUUID } from 'crypto';
import * as qrcode from 'qrcode';

const map = new Map<string, QrCodeInfo>();

interface QrCodeInfo {
  status:
    | 'noscan'
    | 'scan-wait-confirm'
    | 'scan-confirm'
    | 'scan-cancel'
    | 'expired';
  userInfo?: {
    userId: number;
  };
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('qrcode/generate')
  async generateCode() {
    const uuid = randomUUID();
    const dataUrl = await qrcode.toDataURL(
      `http://192.168.0.168:3000/public/confirm.html?id=${uuid}`,
    );

    // 存一份到redis中，此处用map模拟
    map.set(`qrcode_${uuid}`, {
      status: 'noscan',
    });

    return {
      qrcode_id: uuid,
      img: dataUrl,
    };
  }

  // 客户端轮询来查询 二维码 状态
  @Get('qrcode/check')
  check(@Query('id') id: string) {
    return map.get(`qrcode_${id}`);
  }

  // 扫描二维码
  @Get('qrcode/scan')
  scan(@Query('id') id: string) {
    console.log(id, 'iddd');
    const info = map.get(`qrcode_${id}`);
    if (!info) {
      throw new BadRequestException('二维码已过期');
    }

    // 二维码扫扫描成功，也就是等待确认登陆的状态
    info.status = 'scan-wait-confirm';

    return 'success';
  }

  // 确认登陆
  @Get('qrcode/confirm')
  confirm(@Query('id') id: string) {
    const info = map.get(`qrcode_${id}`);
    if (!info) {
      throw new BadRequestException('二维码已过期');
    }

    // 确认登陆
    info.status = 'scan-confirm';

    return 'success';
  }

  // 取消登陆
  @Get('qrcode/cancel')
  cancel(@Query('id') id: string) {
    const info = map.get(`qrcode_${id}`);
    if (!info) {
      throw new BadRequestException('二维码已过期');
    }

    // 取消登陆
    info.status = 'scan-cancel';

    return 'success';
  }
}
