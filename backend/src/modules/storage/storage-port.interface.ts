export const STORAGE_PORT = Symbol('STORAGE_PORT');

export interface UploadableFile {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
}

export interface StoragePort {
  upload(folder: string, file: UploadableFile): Promise<string>;
  delete(url: string): Promise<void>;
}
