// This file configures a Redis client for a standard Node.js environment.
// It uses ioredis, which is suitable for connecting to Google Cloud Memorystore.
// Ensure you have the following environment variables set:
// REDIS_HOST
// REDIS_PORT
// REDIS_PASSWORD (if applicable)

import 'server-only'
import Redis from 'ioredis'

let redisClient: Redis | null = null

export default function getRedisClient(): Redis {
  if (redisClient) {
    return redisClient
  }

  if (!process.env.REDIS_HOST || !process.env.REDIS_PORT) {
    throw new Error('Redis environment variables are not set.')
  }

  redisClient = new Redis({
    host: process.env.REDIS_HOST!,
    port: parseInt(process.env.REDIS_PORT!, 10),
    password: process.env.REDIS_PASSWORD,
    connectTimeout: 100_000,
  })

  return redisClient
}
