// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: { bucketList: { findMany: vi.fn() }, user: { findUnique: vi.fn() } },
}));
vi.mock("@/lib/friend/relation", () => ({ areFriends: vi.fn() }));

import { GET } from "../route";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { areFriends } from "@/lib/friend/relation";

const mockAuth = vi.mocked(auth);
const mockFindMany = vi.mocked(prisma.bucketList.findMany);
const mockFindUniqueUser = vi.mocked(prisma.user.findUnique);
const mockAreFriends = vi.mocked(areFriends);

function makeItem(id: string) {
  return {
    id,
    title: `아이템 ${id}`,
    displayName: "신주쿠구",
    achieved: false,
    placeId: `ChIJ${id}`,
    visibility: "PUBLIC" as const,
    deadlineAt: null,
  };
}

function makeRequest(params: Record<string, string>) {
  const url = new URL("http://localhost/api/bucketlists/by-country");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new Request(url.toString());
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/bucketlists/by-country", () => {
  it("비로그인 → 401", async () => {
    mockAuth.mockResolvedValue(null as never);

    const res = await GET(makeRequest({ countryCode: "JP" }));

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it("countryCode 누락 → 400", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);

    const res = await GET(makeRequest({}));

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it("countryCode 1글자 (Zod min:2 위반) → 400", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);

    const res = await GET(makeRequest({ countryCode: "J" }));

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it("첫 페이지 — items 반환 + nextCursor null", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockFindMany.mockResolvedValue([makeItem("1"), makeItem("2")] as never);

    const res = await GET(makeRequest({ countryCode: "JP" }));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.items).toHaveLength(2);
    expect(body.nextCursor).toBeNull();
  });

  it("cursor 전달 시 findMany에 cursor + skip:1 조건 전달", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockFindMany.mockResolvedValue([makeItem("11")] as never);

    const res = await GET(makeRequest({ countryCode: "JP", cursor: "item-10" }));

    expect(res.status).toBe(200);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        cursor: { id: "item-10" },
        skip: 1,
      }),
    );
  });

  it("PAGE_SIZE+1 개 반환 시 items 10개 슬라이스 + nextCursor 반환", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    // PAGE_SIZE = 10, 11개 반환 → hasMore = true
    const raw = Array.from({ length: 11 }, (_, i) => makeItem(String(i + 1)));
    mockFindMany.mockResolvedValue(raw as never);

    const res = await GET(makeRequest({ countryCode: "JP" }));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.items).toHaveLength(10);
    expect(body.nextCursor).toBe("10"); // 10번째 아이템(index 9)의 id
  });

  it("username 없음 → where에 visibility 필터 없음 (본인 데이터 전체)", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockFindMany.mockResolvedValue([] as never);

    await GET(makeRequest({ countryCode: "JP" }));

    const where = mockFindMany.mock.calls[0][0]?.where as Record<string, unknown>;
    expect(where).not.toHaveProperty("visibility");
    expect(mockFindUniqueUser).not.toHaveBeenCalled();
  });

  describe("username 파라미터 — 비소유자/익명 프로필 조회", () => {
    it("대상 유저 없음 → 404", async () => {
      mockAuth.mockResolvedValue(null as never);
      mockFindUniqueUser.mockResolvedValue(null as never);

      const res = await GET(makeRequest({ countryCode: "JP", username: "ghost" }));

      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.error).toBeDefined();
    });

    it("비로그인 + username → PUBLIC만 조회, areFriends 호출 안 함", async () => {
      mockAuth.mockResolvedValue(null as never);
      mockFindUniqueUser.mockResolvedValue({ id: "target-1" } as never);
      mockFindMany.mockResolvedValue([] as never);

      const res = await GET(makeRequest({ countryCode: "JP", username: "target" }));

      expect(res.status).toBe(200);
      expect(mockAreFriends).not.toHaveBeenCalled();
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: "target-1",
            countryCode: "JP",
            visibility: { in: ["PUBLIC"] },
          }),
        }),
      );
    });

    it("로그인(비친구) + username → PUBLIC만 조회", async () => {
      mockAuth.mockResolvedValue({ user: { id: "viewer-1" } } as never);
      mockFindUniqueUser.mockResolvedValue({ id: "target-1" } as never);
      mockAreFriends.mockResolvedValue(false);
      mockFindMany.mockResolvedValue([] as never);

      const res = await GET(makeRequest({ countryCode: "JP", username: "target" }));

      expect(res.status).toBe(200);
      expect(mockAreFriends).toHaveBeenCalledWith("viewer-1", "target-1");
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ visibility: { in: ["PUBLIC"] } }),
        }),
      );
    });

    it("로그인(친구) + username → PUBLIC+FRIENDS 조회", async () => {
      mockAuth.mockResolvedValue({ user: { id: "viewer-1" } } as never);
      mockFindUniqueUser.mockResolvedValue({ id: "target-1" } as never);
      mockAreFriends.mockResolvedValue(true);
      mockFindMany.mockResolvedValue([] as never);

      const res = await GET(makeRequest({ countryCode: "JP", username: "target" }));

      expect(res.status).toBe(200);
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ visibility: { in: ["PUBLIC", "FRIENDS"] } }),
        }),
      );
    });

    it("본인 프로필(username=자기 자신) → PUBLIC+FRIENDS 조회, areFriends 호출 안 함", async () => {
      mockAuth.mockResolvedValue({ user: { id: "target-1" } } as never);
      mockFindUniqueUser.mockResolvedValue({ id: "target-1" } as never);
      mockFindMany.mockResolvedValue([] as never);

      const res = await GET(makeRequest({ countryCode: "JP", username: "me" }));

      expect(res.status).toBe(200);
      expect(mockAreFriends).not.toHaveBeenCalled();
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ visibility: { in: ["PUBLIC", "FRIENDS"] } }),
        }),
      );
    });
  });
});
