import fs from 'fs';
import path from 'path';

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

export const TEST_USER_EMAIL = 'e2e-test@loglife.local';

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

export default async function globalSetup() {
  loadEnv();

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL이 설정되지 않았습니다. .env.local을 확인하세요.');
  }

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  try {
    // 이전 실행의 잔여 데이터 정리
    const existing = await prisma.user.findUnique({ where: { email: TEST_USER_EMAIL } });
    if (existing) {
      await prisma.bucketList.deleteMany({ where: { userId: existing.id } });
      await prisma.user.delete({ where: { email: TEST_USER_EMAIL } });
    }

    // 테스트 유저 생성
    const user = await prisma.user.create({
      data: {
        email: TEST_USER_EMAIL,
        username: 'e2e-test-user',
        name: 'E2E Test',
      },
    });

    // 지구본 핀 시드 데이터
    // KR: 2개 (1 achieved) → count=2, achievedCount=1 → "1/2" 배지
    // JP: 1개 (0 achieved) → count=1, achievedCount=0 → "0/1" 배지
    await prisma.bucketList.createMany({
      data: [
        {
          userId: user.id,
          title: '경복궁 방문',
          placeId: 'e2e-kr-1',
          lat: 37.5796,
          lng: 126.977,
          countryCode: 'KR',
          displayName: '경복궁, 서울',
          difficulty: 1,
          excitement: 5,
          achieved: true,
          achievedAt: new Date(),
          visibility: 'PUBLIC',
        },
        {
          userId: user.id,
          title: '한라산 등반',
          placeId: 'e2e-kr-2',
          lat: 33.362,
          lng: 126.533,
          countryCode: 'KR',
          displayName: '한라산, 제주',
          difficulty: 3,
          excitement: 4,
          achieved: false,
        },
        {
          userId: user.id,
          title: '후지산 등반',
          placeId: 'e2e-jp-1',
          lat: 35.3606,
          lng: 138.7274,
          countryCode: 'JP',
          displayName: '후지산',
          difficulty: 4,
          excitement: 5,
          achieved: false,
        },
      ],
    });
  } finally {
    await prisma.$disconnect();
  }
}
