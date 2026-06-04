// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: { bucketList: { findFirst: vi.fn() } },
}));

import { GET } from "../route";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const mockAuth = vi.mocked(auth);
const mockFindFirst = vi.mocked(prisma.bucketList.findFirst);

const MOCK_ITEM = {
  id: "item-1",
  title: "도쿄 라멘 골목 탐방",
  description: null,
  visibility: "PUBLIC" as const,
  deadlineAt: null,
  achievedAt: null,
  difficulty: 2,
  excitement: 5,
  achieved: false,
  placeId: "ChIJ1111",
  displayName: "신주쿠구",
  countryCode: "JP",
  shareToken: "abc123",
};

function makeProps(id: string) {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/bucketlists/[id]", () => {
  it("비로그인 → 401", async () => {
    mockAuth.mockResolvedValue(null as never);

    const res = await GET(new Request("http://localhost"), makeProps("item-1"));

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it("자기 아이템 → 200 + 아이템 데이터 반환", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockFindFirst.mockResolvedValue(MOCK_ITEM as never);

    const res = await GET(new Request("http://localhost"), makeProps("item-1"));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe("item-1");
  });

  it("ownership guard — findFirst에 { id, userId } 조건 전달", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockFindFirst.mockResolvedValue(MOCK_ITEM as never);

    await GET(new Request("http://localhost"), makeProps("item-1"));

    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "item-1", userId: "user-1" } }),
    );
  });

  it("타인 아이템 (findFirst → null) → 404", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockFindFirst.mockResolvedValue(null as never);

    const res = await GET(
      new Request("http://localhost"),
      makeProps("other-user-item"),
    );

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });
});
