import { Controller, Get, Inject, Query } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Controller('minio')
export class MinioController {
  constructor(
    @Inject('MINIO_CLIENT') private readonly minioClient: Minio.Client,
    private readonly configService: ConfigService,
  ) {}

  @Get('presignedUrl')
  async tempSecret(@Query('filename') fileName: string) {
    return await this.minioClient.presignedPutObject(
      this.configService.get('MINIO_BUCKET') || 'chat-room',
      fileName,
      3600,
    );
  }
}
