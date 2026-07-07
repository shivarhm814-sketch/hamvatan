import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { QueryPropertiesDto } from './query-properties.dto';

describe('QueryPropertiesDto', () => {
  it('treats empty-string filters (unselected <select>/<input> defaults) as "no filter"', async () => {
    const dto = plainToInstance(QueryPropertiesDto, {
      type: '',
      dealType: '',
      province: '',
      city: '',
    });
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.type).toBeUndefined();
    expect(dto.dealType).toBeUndefined();
    expect(dto.province).toBeUndefined();
    expect(dto.city).toBeUndefined();
  });

  it('falls back to default page/limit when those query params are empty strings', async () => {
    const dto = plainToInstance(QueryPropertiesDto, { page: '', limit: '' });
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(12);
  });

  it('still rejects a genuinely invalid enum value', async () => {
    const dto = plainToInstance(QueryPropertiesDto, { type: 'NOT_A_TYPE' });
    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'type')).toBe(true);
  });

  it('applies provided filters normally', async () => {
    const dto = plainToInstance(QueryPropertiesDto, {
      type: 'VILLA',
      dealType: 'SALE',
      province: 'مازندران',
      city: 'نوشهر',
      page: '2',
      limit: '5',
    });
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.type).toBe('VILLA');
    expect(dto.dealType).toBe('SALE');
    expect(dto.province).toBe('مازندران');
    expect(dto.city).toBe('نوشهر');
    expect(dto.page).toBe(2);
    expect(dto.limit).toBe(5);
  });
});
