import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: 2,
  enableReadyCheck: true,
  lazyConnect: false,
  tls: process.env.REDIS_TLS === "true" ? {} : undefined,
});

export { redis };
