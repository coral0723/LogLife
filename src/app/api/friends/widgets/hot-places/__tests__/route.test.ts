// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/friend/friendIds", () => ({ getAcceptedFriendIds: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: { bucketList: { groupBy: vi.fn() } },
}));

import { GET } from "../route";
import { auth } from "@/auth";
import { getAcceptedFriendIds } from "@/lib/friend/friendIds";
import { prisma } from "@/lib/prisma";

const mockAuth = vi.mocked(auth);
const mockGetAcceptedFriendIds = vi.mocked(getAcceptedFriendIds);
const mockGroupBy = vi.mocked(prisma.bucketList.groupBy);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/friends/widgets/hot-places", () => {
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
    expect(mockGroupBy).not.toHaveBeenCalled();
  });

  it("groupBy 결과 → count 내림차순 top5", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockGetAcceptedFriendIds.mockResolvedValue(["friend-1"]);
    mockGroupBy.mockResolvedValue([
      { countryCode: "JP", displayName: "신주쿠구", _count: { _all: 3 }, _min: { placeId: "place-jp" } },
      { countryCode: "KR", displayName: "강남구", _count: { _all: 5 }, _min: { placeId: "place-kr" } },
    ] as never);

    const res = await GET();

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.items[0]).toEqual({
      countryCode: "KR",
      displayName: "강남구",
      count: 5,
      placeId: "place-kr",
    });
    expect(body.items[1]).toEqual({
      countryCode: "JP",
      displayName: "신주쿠구",
      count: 3,
      placeId: "place-jp",
    });
  });
});
