import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class CustomValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToClass(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      // 🔥 按字段组织错误信息
      const errorMessages = {};

      errors.forEach((error) => {
        const field = error.property;
        const messages = Object.values(error.constraints || {});

        errorMessages[field] =
          messages.length > 0 ? messages : '程序异常，请联系管理员';

        // 处理嵌套对象
        if (error.children && error.children.length > 0) {
          errorMessages[field] = this.formatNestedErrors(error.children);
        }
      });

      throw new BadRequestException({
        statusCode: 400,
        message: '参数验证失败',
        errors: errorMessages,
        timestamp: new Date().toISOString(),
      });
    }

    return object;
  }

  private formatNestedErrors(children: any[], parentKey = ''): any {
    const nestedErrors = {};

    children.forEach((child) => {
      const key = parentKey ? `${parentKey}.${child.property}` : child.property;

      if (child.constraints) {
        nestedErrors[key] = Object.values(child.constraints);
      }

      if (child.children && child.children.length > 0) {
        Object.assign(
          nestedErrors,
          this.formatNestedErrors(child.children, key),
        );
      }
    });

    return nestedErrors;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
