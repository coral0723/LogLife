import { defineConfig, env } from 'prisma/config'

// Vercel 환경에는 .env.local이 없으므로 누락 시 무시
try { process.loadEnvFile('.env.local') } catch {}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
})
