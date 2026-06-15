// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: { friendship: { findMany: vi.fn(), count: vi.fn() } },
}));

import { GET } from "../route";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const mockAuth = vi.mocked(auth);
const mockFindMany = vi.mocked(prisma.friendship.findMany);
const mockCount = vi.mocked(prisma.friendship.count);

function makeRequest(params: Record<string, string> = {}) {
  const url = new URL("http://localhost/api/friends");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new Request(url.toString());
}

function makeFriendship(id: string) {
  return {
    id: `friendship-${id}`,
    requesterId: "user-1",
    addresseeId: `friend-${id}`,
    requester: { id: "user-1", username: "me", name: "나", image: null },
    addressee: {
      id: `friend-${id}`,
      username: `friend${id}`,
      name: `친구${id}`,
      image: null,
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/friends", () => {
  it("비로그인 → 401", async () => {
    mockAuth.mockResolvedValue(null as never);

    const res = await GET(makeRequest());

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it("친구가 없으면 items 빈 배열 + nextCursor null + totalCount 0", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    const res = await GET(makeRequest());

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.items).toEqual([]);
    expect(body.nextCursor).toBeNull();
    expect(body.totalCount).toBe(0);
  });

  it("requester/addressee 구분하여 상대방 정보를 반환한다", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockFindMany.mockResolvedValue([
      {
        id: "friendship-1",
        requesterId: "user-1",
        addresseeId: "friend-a",
        requester: { id: "user-1", username: "me", name: "나", image: null },
        addressee: { id: "friend-a", username: "amy", name: "에이미", image: null },
      },
      {
        id: "friendship-2",
        requesterId: "friend-b",
        addresseeId: "user-1",
        requester: { id: "friend-b", username: "bob", name: "보브", image: null },
        addressee: { id: "user-1", username: "me", name: "나", image: null },
      },
    ] as never);
    mockCount.mockResolvedValue(2);

    const res = await GET(makeRequest());

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.items).toEqual([
      { friendshipId: "friendship-1", id: "friend-a", username: "amy", name: "에이미", image: null },
      { friendshipId: "friendship-2", id: "friend-b", username: "bob", name: "보브", image: null },
    ]);
    expect(body.nextCursor).toBeNull();
    expect(body.totalCount).toBe(2);
  });

  it("cursor 전달 시 findMany에 cursor + skip:1 조건 전달", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockFindMany.mockResolvedValue([] as never);
    mockCount.mockResolvedValue(0);

    const res = await GET(makeRequest({ cursor: "friendship-10" }));

    expect(res.status).toBe(200);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ cursor: { id: "friendship-10" }, skip: 1 }),
    );
  });

  it("PAGE_SIZE+1 개 반환 시 items 10개 슬라이스 + nextCursor 반환", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    // PAGE_SIZE = 10, 11개 반환 → hasMore = true
    const raw = Array.from({ length: 11 }, (_, i) => makeFriendship(String(i + 1)));
    mockFindMany.mockResolvedValue(raw as never);
    mockCount.mockResolvedValue(11);

    const res = await GET(makeRequest());

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.items).toHaveLength(10);
    expect(body.nextCursor).toBe("friendship-10"); // 10번째 아이템(index 9)의 friendshipId
    expect(body.totalCount).toBe(11);
  });
});
