import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@db:5432/phishguard',
  redisUrl: process.env.REDIS_URL,
  aiProvider: process.env.AI_PROVIDER || 'GEMINI',
  aiApiKey: process.env.AI_API_KEY || '',
  sandboxMode: process.env.SANDBOX_MODE === 'true',
  smtpHost: process.env.SMTP_HOST,
  smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
  smtpUser: process.env.SMTP_USER,
  smtpPassword: process.env.SMTP_PASSWORD,
  smtpFrom: process.env.SMTP_FROM || 'noreply@phishguard.local',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
};