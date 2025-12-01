import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class ValidatePipe implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata) {
    console.log(value, metadata, '---------------管道参数');

    if (Number.isNaN(parseInt(value))) {
      throw new BadRequestException(
        `参数类型不正确${metadata.data}---${value}`,
      );
    }

    return typeof value === 'string' ? parseInt(value) : value;
  }
}
