// file: src/modules/upload/upload.controller.ts
import {
  Controller, Post, UploadedFile, UseGuards, UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * TODO: Replace diskStorage with S3/GCS:
 *   import { S3Client } from '@aws-sdk/client-s3';
 *   Use multer-s3 or @google-cloud/storage to stream directly to bucket.
 *   Return the public CDN URL instead of local /uploads/ path.
 */

const storage = diskStorage({
  destination: './uploads',
  filename: (_req, file, cb) => {
    cb(null, `${uuidv4()}${extname(file.originalname)}`);
  },
});

@UseGuards(AuthGuard('jwt'))
@Controller('api/upload')
export class UploadController {
  /**
   * POST /api/upload
   * Content-Type: multipart/form-data
   * Field: file
   * Returns: { url, fileName, size, type }
   */
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
      limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
      fileFilter: (_req, file, cb) => {
        const allowed = /image|video|pdf/;
        if (!allowed.test(file.mimetype)) {
          return cb(new BadRequestException('Tipo de arquivo não suportado'), false);
        }
        cb(null, true);
      },
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Nenhum arquivo enviado');

    return {
      url: `/uploads/${file.filename}`,
      fileName: file.originalname,
      size: file.size,
      type: file.mimetype,
    };
  }
}
