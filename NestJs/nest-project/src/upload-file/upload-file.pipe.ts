import {
  ArgumentMetadata,
  HttpException,
  HttpStatus,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class UploadFilePipe implements PipeTransform {
  transform(value: Express.Multer.File, metadata: ArgumentMetadata) {
    console.log(metadata, 'meta');
    if (value.size > 10 * 1024) {
      throw new HttpException(
        '文件上传大小不能超过10kb',
        HttpStatus.BAD_REQUEST,
      );
    }

    return value;
  }
}
