import {
  Controller,
  FileTypeValidator,
  HttpException,
  HttpStatus,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UploadFileService } from './upload-file.service';
import {
  AnyFilesInterceptor,
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { UploadFilePipe } from './upload-file.pipe';
import { storage } from './sotrage';

@Controller('upload-file')
export class UploadFileController {
  constructor(private readonly uploadFileService: UploadFileService) {}

  // 基本的文件上传
  @Post('upload1')
  @UseInterceptors(FileInterceptor('abc', { dest: './uploads' }))
  Upload1(@UploadedFile('file') file: Express.Multer.File) {
    console.log(file, '1');
    return {
      success: true,
      file,
    };
  }

  // 全局的配置
  @Post('upload2')
  @UseInterceptors(FileInterceptor('abc'))
  Upload2(@UploadedFile('file') file: Express.Multer.File) {
    console.log(file, '2');
    return {
      success: true,
      file,
    };
  }

  // 自定义管道校验
  @Post('upload3')
  @UseInterceptors(FileInterceptor('abc'))
  Upload3(@UploadedFile('file', UploadFilePipe) file: Express.Multer.File) {
    console.log(file, '3');
    return {
      success: true,
      file,
    };
  }

  // 内置的管道校验
  @Post('upload4')
  @UseInterceptors(FileInterceptor('abc'))
  Upload4(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1000 * 1024 }),
          new FileTypeValidator({
            fileType: 'image/png',
            skipMagicNumbersValidation: true,
            fallbackToMimetype: true,
          }),
        ],
        exceptionFactory: (error: string) => {
          throw new HttpException(
            '文件大小或者文件类型不正确，上传失败---' + error,
            HttpStatus.BAD_REQUEST,
          );
        },
      }),
    )
    file: Express.Multer.File,
  ) {
    console.log(file, '4');
    console.log('Real mimetype:', file.mimetype);
    return {
      success: true,
      file,
    };
  }

  // 多文件上传
  @Post('upload5')
  @UseInterceptors(FilesInterceptor('files', 2))
  Upload5(@UploadedFile('files') files: Express.Multer.File[]) {
    console.log(files, '5');
    return {
      success: true,
      files,
    };
  }

  // 多文件上传 多个参数接收
  @Post('upload6')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'files1', maxCount: 2 },
      { name: 'files2', maxCount: 1 },
    ]),
  )
  Upload6(
    @UploadedFile('files')
    files: {
      files1?: Express.Multer.File[];
      files2?: Express.Multer.File[];
    },
  ) {
    console.log(files, '6');
    return {
      success: true,
      files,
    };
  }

  // 多文件上传 任意参数接收
  @Post('upload7')
  @UseInterceptors(AnyFilesInterceptor({ storage: storage }))
  Upload7(
    @UploadedFile('files')
    files: Express.Multer.File[],
  ) {
    console.log(files, '7');
    return {
      success: true,
      files,
    };
  }
}
