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

describe("GET /api/friends/widgets/common-buckets", () => {
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

  it("내 버킷리스트가 없으면 {items: []}", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockGetAcceptedFriendIds.mockResolvedValue(["friend-1"]);
    mockFindMany.mockResolvedValueOnce([]);

    const res = await GET();

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.items).toEqual([]);
  });

  it("같은 placeId 일치 항목 → CommonMatchItem 형태로 반환", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockGetAcceptedFriendIds.mockResolvedValue(["friend-1"]);
    mockFindMany
      .mockResolvedValueOnce([
        { id: "my-1", placeId: "place-1", title: "내 항목", displayName: "신주쿠구", achieved: false },
      ] as never)
      .mockResolvedValueOnce([
        {
          id: "friend-item-1",
          placeId: "place-1",
          title: "친구 항목",
          displayName: "신주쿠구",
          achieved: false,
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
      myItem: { id: "my-1", title: "내 항목", achieved: false },
      friends: [{ id: "friend-1", username: "friend1", name: "친구1", title: "친구 항목", achieved: false }],
    });
  });
});
