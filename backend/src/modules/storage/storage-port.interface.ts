export const STORAGE_PORT = Symbol('STORAGE_PORT');

export interface UploadableFile {
  buffer: Buffer;
  mimetype: string;
  // Must come from validating the file's actual content (magic bytes), never from the
  // client-supplied filename — see assertRealImageType/assertRealDocumentType.
  extension: string;
}

export interface StoragePort {
  upload(folder: string, file: UploadableFile): Promise<string>;
  delete(url: string): Promise<void>;
}
