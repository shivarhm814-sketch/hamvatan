import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().default(3000),
  API_PREFIX: Joi.string().default('api/v1'),

  DATABASE_URL: Joi.string().uri().required(),

  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').optional(),

  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('7d'),

  OTP_LENGTH: Joi.number().min(4).max(8).default(5),
  OTP_TTL_SECONDS: Joi.number().default(120),
  OTP_MAX_ATTEMPTS: Joi.number().default(5),

  SMS_PROVIDER: Joi.string().valid('mock', 'kavenegar').default('mock'),
  SMS_API_KEY: Joi.string().allow('').optional(),
  SMS_SENDER_LINE: Joi.string().allow('').optional(),

  THROTTLE_TTL: Joi.number().default(60),
  THROTTLE_LIMIT: Joi.number().default(10),

  CORS_ORIGIN: Joi.string().required(),

  STORAGE_PROVIDER: Joi.string().valid('s3', 'local').default('s3'),
  STORAGE_LOCAL_DIR: Joi.string().default('uploads'),
  STORAGE_BUCKET: Joi.string().required(),
  STORAGE_REGION: Joi.string().default('default'),
  STORAGE_ENDPOINT: Joi.string().uri().required(),
  STORAGE_ACCESS_KEY_ID: Joi.string().required(),
  STORAGE_SECRET_ACCESS_KEY: Joi.string().required(),
  STORAGE_PUBLIC_BASE_URL: Joi.string().uri().required(),

  SENTRY_DSN: Joi.string().allow('').optional(),
});
