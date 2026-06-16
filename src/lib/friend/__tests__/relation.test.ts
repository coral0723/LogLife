// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: { friendship: { findFirst: vi.fn() } },
}));

import { areFriends, getFriendRelation } from "../relation";
import { prisma } from "@/lib/prisma";

const mockFindFirst = vi.mocked(prisma.friendship.findFirst);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("areFriends", () => {
  it("양방향 중 한쪽이라도 ACCEPTED 관계가 있으면 true", async () => {
    mockFindFirst.mockResolvedValue({ id: "friendship-1" } as never);

    const result = await areFriends("user-a", "user-b");

    expect(result).toBe(true);
    expect(mockFindFirst).toHaveBeenCalledWith({
      where: {
        status: "ACCEPTED",
        OR: [
          { requesterId: "user-a", addresseeId: "user-b" },
          { requesterId: "user-b", addresseeId: "user-a" },
        ],
      },
      select: { id: true },
    });
  });

  it("친구 관계가 없으면 false", async () => {
    mockFindFirst.mockResolvedValue(null);

    const result = await areFriends("user-a", "user-b");

    expect(result).toBe(false);
  });

  it("자기 자신과는 친구 관계가 없으므로 false", async () => {
    mockFindFirst.mockResolvedValue(null);

    const result = await areFriends("user-a", "user-a");

    expect(result).toBe(false);
  });
});

describe("getFriendRelation", () => {
  it("관계가 없으면 none", async () => {
    mockFindFirst.mockResolvedValue(null);

    const result = await getFriendRelation("viewer", "target");

    expect(result).toBe("none");
  });

  it("status가 ACCEPTED이면 friends", async () => {
    mockFindFirst.mockResolvedValue({ requesterId: "viewer", status: "ACCEPTED" } as never);

    const result = await getFriendRelation("viewer", "target");

    expect(result).toBe("friends");
  });

  it("PENDING이고 viewer가 requester이면 pending_sent", async () => {
    mockFindFirst.mockResolvedValue({ requesterId: "viewer", status: "PENDING" } as never);

    const result = await getFriendRelation("viewer", "target");

    expect(result).toBe("pending_sent");
  });

  it("PENDING이고 viewer가 addressee이면 pending_received", async () => {
    mockFindFirst.mockResolvedValue({ requesterId: "target", status: "PENDING" } as never);

    const result = await getFriendRelation("viewer", "target");

    expect(result).toBe("pending_received");
  });
});
