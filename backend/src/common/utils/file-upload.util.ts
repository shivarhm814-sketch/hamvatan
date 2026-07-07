import { BadRequestException } from '@nestjs/common';
import type { Request } from 'express';

type MulterFileFilterCallback = (error: Error | null, acceptFile: boolean) => void;

export const IMAGE_MAX_SIZE_BYTES = 10 * 1024 * 1024;
export const DOCUMENT_MAX_SIZE_BYTES = 10 * 1024 * 1024;
export const DOCUMENT_MAX_COUNT = 5;

const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png'];
const DOCUMENT_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

export function imageFileFilter(
  _req: Request,
  file: Express.Multer.File,
  callback: MulterFileFilterCallback,
): void {
  if (!IMAGE_MIME_TYPES.includes(file.mimetype)) {
    callback(new BadRequestException('فقط فایل‌های JPEG یا PNG مجاز هستند.'), false);
    return;
  }
  callback(null, true);
}

export function documentFileFilter(
  _req: Request,
  file: Express.Multer.File,
  callback: MulterFileFilterCallback,
): void {
  if (!DOCUMENT_MIME_TYPES.includes(file.mimetype)) {
    callback(new BadRequestException('فقط فایل‌های JPEG، PNG یا PDF مجاز هستند.'), false);
    return;
  }
  callback(null, true);
}
