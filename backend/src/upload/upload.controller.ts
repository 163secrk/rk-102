import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import * as fs from 'fs';

const uploadDir = './uploads/credentials';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

@ApiTags('文件上传 Upload')
@Controller('upload')
export class UploadController {
  @Post('credentials')
  @ApiOperation({ summary: '上传资质证明文件' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: uploadDir,
        filename: (req, file, callback) => {
          const randomName = uuidv4();
          const ext = extname(file.originalname).toLowerCase();
          callback(null, `${randomName}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        const allowedExts = ['.jpg', '.jpeg', '.png', '.pdf', '.gif', '.bmp', '.webp'];
        const ext = extname(file.originalname).toLowerCase();
        if (allowedExts.includes(ext)) {
          callback(null, true);
        } else {
          callback(new BadRequestException('不支持的文件格式，仅支持图片和PDF文件'), false);
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadCredential(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('请选择要上传的文件');
    }

    const fileUrl = `/uploads/credentials/${file.filename}`;

    return {
      url: fileUrl,
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  }
}
