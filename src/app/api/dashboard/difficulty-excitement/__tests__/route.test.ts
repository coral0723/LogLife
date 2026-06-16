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

function makeRequest(params: Record<string, string> = {}) {
  const url = new URL("http://localhost/api/dashboard/difficulty-excitement");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new Request(url.toString());
}

beforeEach(() => {
  vi.clearAllMocks();
  mockFindMany.mockResolvedValue([] as never);
});

describe("GET /api/dashboard/difficulty-excitement", () => {
  it("username 없음 + 비로그인 → 401", async () => {
    mockAuth.mockResolvedValue(null as never);

    const res = await GET(makeRequest());

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it("username 없음 + 로그인 → 200, visibility 필터 없음(본인 데이터 전체)", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);

    const res = await GET(makeRequest());

    expect(res.status).toBe(200);
    const where = mockFindMany.mock.calls[0][0]?.where as Record<string, unknown>;
    expect(where).not.toHaveProperty("visibility");
    expect(mockFindUniqueUser).not.toHaveBeenCalled();
  });

  describe("username 파라미터 — 비소유자/익명 프로필 조회", () => {
    it("대상 유저 없음 → 404", async () => {
      mockAuth.mockResolvedValue(null as never);
      mockFindUniqueUser.mockResolvedValue(null as never);

      const res = await GET(makeRequest({ username: "ghost" }));

      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.error).toBeDefined();
    });

    it("비로그인 + username → PUBLIC만 조회, areFriends 호출 안 함", async () => {
      mockAuth.mockResolvedValue(null as never);
      mockFindUniqueUser.mockResolvedValue({ id: "target-1" } as never);

      const res = await GET(makeRequest({ username: "target" }));

      expect(res.status).toBe(200);
      expect(mockAreFriends).not.toHaveBeenCalled();
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: "target-1",
            visibility: { in: ["PUBLIC"] },
          }),
        }),
      );
    });

    it("로그인(비친구) + username → PUBLIC만 조회", async () => {
      mockAuth.mockResolvedValue({ user: { id: "viewer-1" } } as never);
      mockFindUniqueUser.mockResolvedValue({ id: "target-1" } as never);
      mockAreFriends.mockResolvedValue(false);

      const res = await GET(makeRequest({ username: "target" }));

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

      const res = await GET(makeRequest({ username: "target" }));

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

      const res = await GET(makeRequest({ username: "me" }));

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
