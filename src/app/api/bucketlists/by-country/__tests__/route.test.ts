// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: { bucketList: { findMany: vi.fn() } },
}));

import { GET } from "../route";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const mockAuth = vi.mocked(auth);
const mockFindMany = vi.mocked(prisma.bucketList.findMany);

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
});
