import fs from 'fs';
import path from 'path';

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

import { TEST_USER_EMAIL } from './global.setup';

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;
  fs.readFileSync(envPath, 'utf-8')
    .split('\n')
    .filter((line) => line.trim() && !line.startsWith('#'))
    .forEach((line) => {
      const idx = line.indexOf('=');
      if (idx === -1) return;
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      if (key && !(key in process.env)) process.env[key] = val;
    });
}

export default async function globalTeardown() {
  loadEnv();

  if (!process.env.DATABASE_URL) return;

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  try {
    const user = await prisma.user.findUnique({ where: { email: TEST_USER_EMAIL } });
    if (user) {
      await prisma.bucketList.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { email: TEST_USER_EMAIL } });
    }
  } finally {
    await prisma.$disconnect();
  }
}
