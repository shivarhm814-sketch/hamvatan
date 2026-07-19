import { BadRequestException } from '@nestjs/common';
import type { Request } from 'express';

type MulterFileFilterCallback = (error: Error | null, acceptFile: boolean) => void;

export const IMAGE_MAX_SIZE_BYTES = 10 * 1024 * 1024;
export const DOCUMENT_MAX_SIZE_BYTES = 10 * 1024 * 1024;
export const DOCUMENT_MAX_COUNT = 5;

const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png'];
const DOCUMENT_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

// Multer's fileFilter only sees the declared Content-Type header (attacker-controlled),
// not the file bytes — this is just a cheap early rejection, not the real check.
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

export interface DetectedFile {
  mimetype: 'image/jpeg' | 'image/png' | 'application/pdf';
  extension: '.jpg' | '.png' | '.pdf';
}

// The real, content-based check: sniff the file's magic bytes instead of trusting
// the client-declared Content-Type. This is what the stored file's extension must
// come from — never the client-supplied filename.
const FILE_SIGNATURES: { magic: number[]; result: DetectedFile }[] = [
  { magic: [0xff, 0xd8, 0xff], result: { mimetype: 'image/jpeg', extension: '.jpg' } },
  {
    magic: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
    result: { mimetype: 'image/png', extension: '.png' },
  },
  {
    magic: [0x25, 0x50, 0x44, 0x46, 0x2d],
    result: { mimetype: 'application/pdf', extension: '.pdf' },
  },
];

export function detectFileType(buffer: Buffer): DetectedFile | null {
  for (const { magic, result } of FILE_SIGNATURES) {
    if (buffer.length >= magic.length && magic.every((byte, i) => buffer[i] === byte)) {
      return result;
    }
  }
  return null;
}

export function assertRealImageType(buffer: Buffer): DetectedFile {
  const detected = detectFileType(buffer);
  if (!detected || !['image/jpeg', 'image/png'].includes(detected.mimetype)) {
    throw new BadRequestException('فقط فایل‌های JPEG یا PNG مجاز هستند.');
  }
  return detected;
}

export function assertRealDocumentType(buffer: Buffer): DetectedFile {
  const detected = detectFileType(buffer);
  if (!detected) {
    throw new BadRequestException('فقط فایل‌های JPEG، PNG یا PDF مجاز هستند.');
  }
  return detected;
}
