// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: { friendship: { findMany: vi.fn() } },
}));

import { getAcceptedFriendIds } from "../friendIds";
import { prisma } from "@/lib/prisma";

const mockFindMany = vi.mocked(prisma.friendship.findMany);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getAcceptedFriendIds", () => {
  it("내가 requester인 친구 관계 → addresseeId 반환", async () => {
    mockFindMany.mockResolvedValue([
      { requesterId: "me", addresseeId: "friend-1" },
    ] as never);

    const result = await getAcceptedFriendIds("me");

    expect(result).toEqual(["friend-1"]);
    expect(mockFindMany).toHaveBeenCalledWith({
      where: {
        status: "ACCEPTED",
        OR: [{ requesterId: "me" }, { addresseeId: "me" }],
      },
      select: { requesterId: true, addresseeId: true },
    });
  });

  it("내가 addressee인 친구 관계 → requesterId 반환", async () => {
    mockFindMany.mockResolvedValue([
      { requesterId: "friend-2", addresseeId: "me" },
    ] as never);

    const result = await getAcceptedFriendIds("me");

    expect(result).toEqual(["friend-2"]);
  });

  it("친구가 없으면 빈 배열 반환", async () => {
    mockFindMany.mockResolvedValue([]);

    const result = await getAcceptedFriendIds("me");

    expect(result).toEqual([]);
  });
});
