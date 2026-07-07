import { ArgumentsHost, BadRequestException } from '@nestjs/common';
import { MulterError } from 'multer';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  const filter = new HttpExceptionFilter();

  const buildHost = () => {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const response = { status };
    const request = { method: 'POST', url: '/api/v1/properties/123/images' };
    const host = {
      switchToHttp: () => ({
        getResponse: () => response,
        getRequest: () => request,
      }),
    } as unknown as ArgumentsHost;
    return { host, status, json };
  };

  it('maps a Multer file-size error to 400 with a friendly Persian message', () => {
    const { host, status, json } = buildHost();
    const error = new MulterError('LIMIT_FILE_SIZE');

    filter.catch(error, host);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'حجم فایل ارسالی بیش از حد مجاز است.' }),
    );
  });

  it('maps a Multer file-count error to 400', () => {
    const { host, status } = buildHost();
    filter.catch(new MulterError('LIMIT_FILE_COUNT'), host);
    expect(status).toHaveBeenCalledWith(400);
  });

  it('still maps a normal HttpException to its own status code', () => {
    const { host, status, json } = buildHost();
    filter.catch(new BadRequestException('نامعتبر'), host);
    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ message: 'نامعتبر' }));
  });

  it('falls back to 500 for unknown errors', () => {
    const { host, status } = buildHost();
    filter.catch(new Error('boom'), host);
    expect(status).toHaveBeenCalledWith(500);
  });
});
