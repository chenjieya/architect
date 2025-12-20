import { Controller, Get, Inject, Query } from '@nestjs/common';
import * as Minio from 'minio';

@Controller('minio')
export class MinioController {
  constructor(@Inject('MINIO_CLIENT') private readonly client: Minio.Client) {}

  @Get('presignedUrl')
  async upload(@Query('name') fileName: string) {
    return await this.client.presignedPutObject('test', fileName, 3600);
  }
}
