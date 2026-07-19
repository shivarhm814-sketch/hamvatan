import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import { existsSync } from 'fs';
import { readFile, rm } from 'fs/promises';
import { join } from 'path';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  const s3Mock = mockClient(S3Client);

  const config: Record<string, string> = {
    'storage.bucket': 'esmaeili-dev',
    'storage.region': 'default',
    'storage.endpoint': 'https://s3.ir-thr-at1.arvanstorage.ir',
    'storage.accessKeyId': 'key',
    'storage.secretAccessKey': 'secret',
    'storage.publicBaseUrl': 'https://esmaeili-dev.s3.ir-thr-at1.arvanstorage.ir/',
  };
  const configMock = { get: jest.fn((key: string) => config[key]) };

  let service: StorageService;

  beforeEach(async () => {
    s3Mock.reset();
    const moduleRef = await Test.createTestingModule({
      providers: [StorageService, { provide: ConfigService, useValue: configMock }],
    }).compile();

    service = moduleRef.get(StorageService);
  });

  it('uploads a file under a uuid-based key and returns the public url', async () => {
    s3Mock.on(PutObjectCommand).resolves({});

    const url = await service.upload('properties', {
      buffer: Buffer.from('data'),
      mimetype: 'image/png',
      extension: '.png',
    });

    expect(url).toMatch(
      /^https:\/\/esmaeili-dev\.s3\.ir-thr-at1\.arvanstorage\.ir\/properties\/[0-9a-f-]{36}\.png$/,
    );
    expect(url).not.toContain('my photo');
  });

  it('deletes an object by re-deriving its key from the public url', async () => {
    s3Mock.on(DeleteObjectCommand).resolves({});

    await service.delete('https://esmaeili-dev.s3.ir-thr-at1.arvanstorage.ir/properties/abc.png');

    expect(s3Mock.commandCalls(DeleteObjectCommand)[0].args[0].input).toEqual({
      Bucket: 'esmaeili-dev',
      Key: 'properties/abc.png',
    });
  });

  it('ignores a delete request for a url outside our storage', async () => {
    s3Mock.on(DeleteObjectCommand).resolves({});

    await service.delete('https://some-other-host.example.com/properties/abc.png');

    expect(s3Mock.commandCalls(DeleteObjectCommand)).toHaveLength(0);
  });

  describe('local provider', () => {
    const localDir = join(process.cwd(), 'test-uploads-tmp');
    const localConfig: Record<string, string> = {
      'storage.provider': 'local',
      'storage.localDir': 'test-uploads-tmp',
      'storage.publicBaseUrl': 'http://localhost:3000/uploads',
    };
    let localService: StorageService;

    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        providers: [
          StorageService,
          { provide: ConfigService, useValue: { get: jest.fn((key: string) => localConfig[key]) } },
        ],
      }).compile();
      localService = moduleRef.get(StorageService);
    });

    afterAll(async () => {
      await rm(localDir, { recursive: true, force: true });
    });

    it('writes the file to disk and returns a public url under the local base url', async () => {
      const url = await localService.upload('properties', {
        buffer: Buffer.from('hello'),
        mimetype: 'image/png',
        extension: '.png',
      });

      expect(url).toMatch(/^http:\/\/localhost:3000\/uploads\/properties\/[0-9a-f-]{36}\.png$/);
      const key = url.replace('http://localhost:3000/uploads/', '');
      const filePath = join(localDir, key);
      expect(existsSync(filePath)).toBe(true);
      expect((await readFile(filePath)).toString()).toBe('hello');
    });

    it('deletes the file from disk when given its public url', async () => {
      const url = await localService.upload('properties', {
        buffer: Buffer.from('hello'),
        mimetype: 'image/png',
        extension: '.png',
      });
      const key = url.replace('http://localhost:3000/uploads/', '');
      const filePath = join(localDir, key);
      expect(existsSync(filePath)).toBe(true);

      await localService.delete(url);

      expect(existsSync(filePath)).toBe(false);
    });
  });
});
