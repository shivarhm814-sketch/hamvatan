// Hosting providers (Railway, Render, Heroku, ...) typically expose Redis as a single
// connection string rather than separate host/port/password env vars — parse it if present.
function redisFromUrl(url?: string): { host?: string; port?: number; password?: string } {
  if (!url) return {};
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parsed.port ? parseInt(parsed.port, 10) : 6379,
      password: parsed.password || undefined,
    };
  } catch {
    return {};
  }
}

const redisUrlParts = redisFromUrl(process.env.REDIS_URL);

export default () => ({
  nodeEnv: process.env.NODE_ENV,
  port: parseInt(process.env.PORT ?? '3000', 10),
  apiPrefix: process.env.API_PREFIX ?? 'api/v1',

  database: {
    url: process.env.DATABASE_URL,
  },

  redis: {
    host: redisUrlParts.host ?? process.env.REDIS_HOST,
    port: redisUrlParts.port ?? parseInt(process.env.REDIS_PORT ?? '6379', 10),
    password: redisUrlParts.password ?? (process.env.REDIS_PASSWORD || undefined),
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },

  otp: {
    length: parseInt(process.env.OTP_LENGTH ?? '5', 10),
    ttlSeconds: parseInt(process.env.OTP_TTL_SECONDS ?? '120', 10),
    maxAttempts: parseInt(process.env.OTP_MAX_ATTEMPTS ?? '5', 10),
  },

  sms: {
    provider: process.env.SMS_PROVIDER ?? 'mock',
    apiKey: process.env.SMS_API_KEY,
    senderLine: process.env.SMS_SENDER_LINE,
  },

  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL ?? '60', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT ?? '10', 10),
  },

  corsOrigin: process.env.CORS_ORIGIN,

  storage: {
    provider: process.env.STORAGE_PROVIDER ?? 's3',
    localDir: process.env.STORAGE_LOCAL_DIR ?? 'uploads',
    bucket: process.env.STORAGE_BUCKET,
    region: process.env.STORAGE_REGION ?? 'default',
    endpoint: process.env.STORAGE_ENDPOINT,
    accessKeyId: process.env.STORAGE_ACCESS_KEY_ID,
    secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY,
    publicBaseUrl: process.env.STORAGE_PUBLIC_BASE_URL,
  },

  sentryDsn: process.env.SENTRY_DSN || undefined,
});
