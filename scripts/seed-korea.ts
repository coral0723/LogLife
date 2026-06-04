import { PrismaClient, Visibility } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL이 설정되지 않았습니다.");
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const KOREA_ITEMS: Array<{
  title: string;
  displayName: string;
  placeId: string;
  lat: number;
  lng: number;
  cityName: string;
  admin1Code: string;
  difficulty: number;
  excitement: number;
  visibility: Visibility;
  achieved: boolean;
  achievedAt?: Date;
  deadlineAt?: Date;
}> = [
  {
    title: "경복궁에서 한복 입고 사진 찍기",
    displayName: "경복궁",
    placeId: "ChIJzWXFYolUezURgIFAcd4lDM8",
    lat: 37.5796, lng: 126.977,
    cityName: "서울", admin1Code: "KR-11",
    difficulty: 2, excitement: 8,
    visibility: "PUBLIC", achieved: true,
    achievedAt: new Date("2025-03-15"),
  },
  {
    title: "한라산 정상 등반",
    displayName: "한라산 국립공원",
    placeId: "ChIJXfYW7aBTDDURMbdFOuCYdwc",
    lat: 33.362, lng: 126.533,
    cityName: "제주", admin1Code: "KR-49",
    difficulty: 8, excitement: 10,
    visibility: "PUBLIC", achieved: false,
    deadlineAt: new Date("2025-12-31"),
  },
  {
    title: "해운대 해수욕장에서 일출 보기",
    displayName: "해운대 해수욕장",
    placeId: "ChIJM2sTlb-GaDURpD_5aeBbFVw",
    lat: 35.1587, lng: 129.16,
    cityName: "부산", admin1Code: "KR-26",
    difficulty: 3, excitement: 9,
    visibility: "FRIENDS", achieved: true,
    achievedAt: new Date("2025-01-01"),
  },
  {
    title: "N서울타워에서 야경 감상",
    displayName: "N서울타워",
    placeId: "ChIJW7RNSo1UezURjt_rZqEFMgU",
    lat: 37.5512, lng: 126.9882,
    cityName: "서울", admin1Code: "KR-11",
    difficulty: 1, excitement: 7,
    visibility: "PRIVATE", achieved: false,
  },
  {
    title: "전주 한옥마을 전통 음식 투어",
    displayName: "전주 한옥마을",
    placeId: "ChIJQ-7yYjdaazURe8gV3yY0Deo",
    lat: 35.8175, lng: 127.1535,
    cityName: "전주", admin1Code: "KR-45",
    difficulty: 2, excitement: 8,
    visibility: "PUBLIC", achieved: false,
    deadlineAt: new Date("2024-11-30"),
  },
  {
    title: "설악산 울산바위 트레킹",
    displayName: "설악산 국립공원",
    placeId: "ChIJxWpMoumpcTURU2YcKK03Cpg",
    lat: 38.1195, lng: 128.4656,
    cityName: "속초", admin1Code: "KR-42",
    difficulty: 7, excitement: 9,
    visibility: "FRIENDS", achieved: false,
  },
  {
    title: "부산 감천문화마을 벽화 구경",
    displayName: "감천문화마을",
    placeId: "ChIJ2UaY6q2GaDURPWBx5lSBkC4",
    lat: 35.0975, lng: 129.0107,
    cityName: "부산", admin1Code: "KR-26",
    difficulty: 2, excitement: 7,
    visibility: "PUBLIC", achieved: true,
    achievedAt: new Date("2025-05-10"),
  },
  {
    title: "경주 불국사 새벽 예불 참여",
    displayName: "불국사",
    placeId: "ChIJv0MPFg8UbDURf42D3VbCqJU",
    lat: 35.7896, lng: 129.3316,
    cityName: "경주", admin1Code: "KR-47",
    difficulty: 4, excitement: 9,
    visibility: "PRIVATE", achieved: false,
  },
  {
    title: "남이섬 가을 단풍 자전거 라이딩",
    displayName: "남이섬",
    placeId: "ChIJETsKZ3xZczUR4_kxLpCVrUE",
    lat: 37.7932, lng: 127.527,
    cityName: "춘천", admin1Code: "KR-42",
    difficulty: 2, excitement: 8,
    visibility: "PUBLIC", achieved: false,
    deadlineAt: new Date("2025-11-15"),
  },
  {
    title: "인사동 갤러리 투어 및 전통차 체험",
    displayName: "인사동",
    placeId: "ChIJL3AHTolUezURxP4_NTxFiWQ",
    lat: 37.5742, lng: 126.9852,
    cityName: "서울", admin1Code: "KR-11",
    difficulty: 1, excitement: 6,
    visibility: "FRIENDS", achieved: false,
  },
  {
    title: "창덕궁 비원(후원) 특별 관람",
    displayName: "창덕궁",
    placeId: "ChIJv4NWkIxUezUR6rJFnpB3o3g",
    lat: 37.5794, lng: 126.9910,
    cityName: "서울", admin1Code: "KR-11",
    difficulty: 2, excitement: 8,
    visibility: "PUBLIC", achieved: false,
  },
  {
    title: "제주 올레길 7코스 완주",
    displayName: "제주 올레길 7코스",
    placeId: "ChIJLwFPjFxPDDURzHdxCpQpQK8",
    lat: 33.2429, lng: 126.5113,
    cityName: "서귀포", admin1Code: "KR-49",
    difficulty: 5, excitement: 9,
    visibility: "FRIENDS", achieved: false,
  },
];

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: "san9901ho@gmail.com" },
    select: { id: true, email: true },
  });

  if (!user) {
    console.error("사용자를 찾을 수 없습니다. (san9901ho@gmail.com)");
    process.exit(1);
  }

  console.log(`사용자 확인: ${user.email} (${user.id})`);

  // 기존 테스트 데이터 제거 방지: 이미 KR 데이터가 많으면 중단
  const existing = await prisma.bucketList.count({
    where: { userId: user.id, countryCode: "KR" },
  });
  console.log(`기존 KR 버킷리스트: ${existing}개`);

  const created = await prisma.bucketList.createMany({
    data: KOREA_ITEMS.map((item) => ({
      userId: user.id,
      countryCode: "KR",
      ...item,
    })),
    skipDuplicates: true,
  });

  console.log(`✓ ${created.count}개 생성 완료`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
