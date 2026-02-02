import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import * as qrcode from 'qrcode';
import { randomUUID } from 'crypto';
import { RedisService } from 'src/redis/redis.service';
import { QRCODE_STATUS } from 'src/enum/qrcode';
import { NoNeedToken } from 'src/custom-decorator/custom.decorator';

@Controller('qrcode')
@NoNeedToken()
export class ScanController {
  constructor(private readonly redisService: RedisService) {}

  @Get('generate')
  async generate() {
    const uuid = randomUUID();
    const qrcodeUrl = await qrcode.toDataURL(
      `http://localhost:3000/public/confirm.html?id=${uuid}`,
    );

    // 在redis中设置对应的二维码，并加上过期时间
    await this.redisService.set(
      `qrcode:${uuid}`,
      {
        id: uuid,
        status: QRCODE_STATUS.PENDING,
      },
      120,
    );

    return {
      qrcode_id: uuid,
      img: qrcodeUrl,
      content: `http://localhost:3000/public/confirm.html?id=${uuid}`,
    };
  }
  // 客户端轮询来查询 二维码 状态
  @Get('check')
  async check(@Query('id') id: string) {
    const info = await this.redisService.get<{
      status: QRCODE_STATUS;
      id: string;
      userId?: string;
    } | null>(`qrcode:${id}`);
    if (!info) {
      return { status: QRCODE_STATUS.EXPIRED };
    }

    let token: string | null = null;
    if (info.userId) {
      token = await this.redisService.get<string>(`user_${info.userId}:token`);
    }

    return {
      id: info.id,
      status: info.status,
      access_token: token ? token : null,
    };
  }

  // 扫描二维码
  @Get('scan')
  async scan(@Query('id') id: string) {
    const info = await this.redisService.get<{
      status: QRCODE_STATUS;
      id: string;
    } | null>(`qrcode:${id}`);
    if (!info) {
      throw new BadRequestException('二维码已过期');
    }

    if (info.status !== QRCODE_STATUS.PENDING) {
      throw new BadRequestException('二维码状态异常');
    }

    // 修改状态为已扫描
    info.status = QRCODE_STATUS.SCANNED;

    await this.redisService.set(`qrcode:${info.id}`, info, 120);

    return {
      success: true,
    };
  }

  // 确认登陆
  @Get('confirm')
  async confirm(@Query('id') id: string) {
    const info = await this.redisService.get<{
      status: QRCODE_STATUS;
      id: string;
    } | null>(`qrcode:${id}`);
    if (!info) {
      throw new BadRequestException('二维码已过期');
    }

    if (info.status !== QRCODE_STATUS.SCANNED) {
      throw new BadRequestException('二维码状态异常');
    }

    // 修改状态为已确认
    info.status = QRCODE_STATUS.CONFIRMED;

    await this.redisService.set(`qrcode:${id}`, info, 120);

    return {
      success: true,
    };
  }

  // 取消登陆
  @Get('cancel')
  async cancel(@Query('id') id: string) {
    const info = await this.redisService.get<{
      status: QRCODE_STATUS;
      id: string;
    } | null>(`qrcode:${id}`);
    if (!info) {
      throw new BadRequestException('二维码已过期');
    }

    if (info.status !== QRCODE_STATUS.SCANNED) {
      throw new BadRequestException('二维码状态异常');
    }

    // 修改状态为已确认
    info.status = QRCODE_STATUS.CANCELLED;

    await this.redisService.set(`qrcode:${id}`, info, 120);

    return {
      success: true,
    };
  }
}
