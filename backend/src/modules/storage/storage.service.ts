import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { join } from 'path';
import { mkdir, rm, writeFile } from 'fs/promises';
import { randomUUID } from 'crypto';
import { StoragePort, UploadableFile } from './storage-port.interface';

@Injectable()
export class StorageService implements StoragePort {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl: string;
  private readonly provider: string;
  private readonly localRootDir: string;

  constructor(private readonly configService: ConfigService) {
    this.provider = this.configService.get<string>('storage.provider') ?? 's3';
    this.localRootDir = join(
      process.cwd(),
      this.configService.get<string>('storage.localDir') ?? 'uploads',
    );
    this.bucket = this.configService.get<string>('storage.bucket') as string;
    this.publicBaseUrl = (
      this.configService.get<string>('storage.publicBaseUrl') as string
    ).replace(/\/$/, '');

    this.client = new S3Client({
      region: this.configService.get<string>('storage.region') ?? 'default',
      endpoint: this.configService.get<string>('storage.endpoint'),
      forcePathStyle: false,
      credentials: {
        accessKeyId: this.configService.get<string>('storage.accessKeyId') as string,
        secretAccessKey: this.configService.get<string>('storage.secretAccessKey') as string,
      },
    });
  }

  async upload(folder: string, file: UploadableFile): Promise<string> {
    const key = `${folder}/${randomUUID()}${file.extension}`;

    if (this.provider === 'local') {
      const filePath = join(this.localRootDir, key);
      await mkdir(join(this.localRootDir, folder), { recursive: true });
      await writeFile(filePath, file.buffer);
      return `${this.publicBaseUrl}/${key}`;
    }

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      }),
    );

    return `${this.publicBaseUrl}/${key}`;
  }

  async delete(url: string): Promise<void> {
    if (!url.startsWith(this.publicBaseUrl)) {
      return;
    }
    const key = url.slice(this.publicBaseUrl.length + 1);

    if (this.provider === 'local') {
      await rm(join(this.localRootDir, key), { force: true });
      return;
    }

    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }
}
