// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findMany: vi.fn() },
    friendship: { findMany: vi.fn() },
  },
}));

import { GET } from "../route";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const mockAuth = vi.mocked(auth);
const mockUserFindMany = vi.mocked(prisma.user.findMany);
const mockFriendshipFindMany = vi.mocked(prisma.friendship.findMany);

function makeRequest(q?: string) {
  const url = new URL("http://localhost/api/friends/search");
  if (q !== undefined) url.searchParams.set("q", q);
  return new Request(url.toString());
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/friends/search", () => {
  it("비로그인 → 401", async () => {
    mockAuth.mockResolvedValue(null as never);

    const res = await GET(makeRequest("amy"));

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it("q 누락 → {items: []}, user.findMany 호출 안 됨", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);

    const res = await GET(makeRequest());

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.items).toEqual([]);
    expect(mockUserFindMany).not.toHaveBeenCalled();
  });

  it("q가 공백뿐이면 {items: []}", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);

    const res = await GET(makeRequest("   "));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.items).toEqual([]);
    expect(mockUserFindMany).not.toHaveBeenCalled();
  });

  it("검색 결과 — 관계 없는 유저는 relation: none", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockUserFindMany.mockResolvedValue([
      { id: "user-2", username: "amy", name: "에이미", image: null },
    ] as never);
    mockFriendshipFindMany.mockResolvedValue([]);

    const res = await GET(makeRequest("amy"));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.items).toEqual([
      { id: "user-2", username: "amy", name: "에이미", image: null, relation: "none" },
    ]);
  });

  it("이미 친구 → relation: friends + friendshipId", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockUserFindMany.mockResolvedValue([
      { id: "user-2", username: "amy", name: "에이미", image: null },
    ] as never);
    mockFriendshipFindMany.mockResolvedValue([
      { id: "friendship-1", requesterId: "user-1", addresseeId: "user-2", status: "ACCEPTED" },
    ] as never);

    const res = await GET(makeRequest("amy"));

    const body = await res.json();
    expect(body.items[0]).toMatchObject({ relation: "friends", friendshipId: "friendship-1" });
  });

  it("내가 요청 보냄 → relation: pending_sent", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockUserFindMany.mockResolvedValue([
      { id: "user-2", username: "amy", name: "에이미", image: null },
    ] as never);
    mockFriendshipFindMany.mockResolvedValue([
      { id: "friendship-1", requesterId: "user-1", addresseeId: "user-2", status: "PENDING" },
    ] as never);

    const res = await GET(makeRequest("amy"));

    const body = await res.json();
    expect(body.items[0]).toMatchObject({ relation: "pending_sent", friendshipId: "friendship-1" });
  });

  it("상대가 요청 보냄 → relation: pending_received", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockUserFindMany.mockResolvedValue([
      { id: "user-2", username: "amy", name: "에이미", image: null },
    ] as never);
    mockFriendshipFindMany.mockResolvedValue([
      { id: "friendship-1", requesterId: "user-2", addresseeId: "user-1", status: "PENDING" },
    ] as never);

    const res = await GET(makeRequest("amy"));

    const body = await res.json();
    expect(body.items[0]).toMatchObject({ relation: "pending_received", friendshipId: "friendship-1" });
  });

  it("id != me, take 20 조건 전달", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockUserFindMany.mockResolvedValue([]);

    await GET(makeRequest("amy"));

    expect(mockUserFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: { not: "user-1" } }),
        take: 20,
      }),
    );
  });
});
