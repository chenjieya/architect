import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MinioController } from './minio.controller';
import * as Minio from 'minio';

@Global()
@Module({
  providers: [
    {
      inject: [ConfigService],
      provide: 'MINIO_CLIENT',
      useFactory(config: ConfigService) {
        const client = new Minio.Client({
          endPoint: config.get('MINIO_HOST')!,
          port: config.get('MINIO_PORT')!,
          useSSL: false,
          accessKey: config.get('MINIO_ACCESS_KEY')!,
          secretKey: config.get('MINIO_SECRET_KEY')!,
        });

        return client;
      },
    },
  ],
  controllers: [MinioController],
})
export class MinioModule {}
