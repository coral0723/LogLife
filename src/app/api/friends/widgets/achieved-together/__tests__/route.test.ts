// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/friend/friendIds", () => ({ getAcceptedFriendIds: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: { bucketList: { findMany: vi.fn() } },
}));

import { GET } from "../route";
import { auth } from "@/auth";
import { getAcceptedFriendIds } from "@/lib/friend/friendIds";
import { prisma } from "@/lib/prisma";

const mockAuth = vi.mocked(auth);
const mockGetAcceptedFriendIds = vi.mocked(getAcceptedFriendIds);
const mockFindMany = vi.mocked(prisma.bucketList.findMany);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/friends/widgets/achieved-together", () => {
  it("비로그인 → 401", async () => {
    mockAuth.mockResolvedValue(null as never);

    const res = await GET();

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it("친구가 없으면 {items: []}", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockGetAcceptedFriendIds.mockResolvedValue([]);

    const res = await GET();

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.items).toEqual([]);
    expect(mockFindMany).not.toHaveBeenCalled();
  });

  it("내 달성 항목이 없으면 {items: []}", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockGetAcceptedFriendIds.mockResolvedValue(["friend-1"]);
    mockFindMany.mockResolvedValueOnce([]);

    const res = await GET();

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.items).toEqual([]);
  });

  it("30일 이내 같은 장소 달성 → moment 반환", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockGetAcceptedFriendIds.mockResolvedValue(["friend-1"]);
    mockFindMany
      .mockResolvedValueOnce([
        {
          id: "my-1",
          placeId: "place-1",
          title: "내 항목",
          displayName: "신주쿠구",
          achievedAt: new Date("2026-06-01T00:00:00Z"),
        },
      ] as never)
      .mockResolvedValueOnce([
        {
          id: "friend-item-1",
          placeId: "place-1",
          title: "친구 항목",
          displayName: "신주쿠구",
          achievedAt: new Date("2026-06-05T00:00:00Z"),
          userId: "friend-1",
          user: { username: "friend1", name: "친구1" },
        },
      ] as never);

    const res = await GET();

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.items).toHaveLength(1);
    expect(body.items[0]).toMatchObject({
      placeId: "place-1",
      displayName: "신주쿠구",
      daysApart: 4,
      friendItem: { friendId: "friend-1", friendUsername: "friend1", friendName: "친구1" },
    });
  });
});
