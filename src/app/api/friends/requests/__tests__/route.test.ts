// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: { friendship: { findMany: vi.fn() } },
}));

import { GET } from "../route";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const mockAuth = vi.mocked(auth);
const mockFindMany = vi.mocked(prisma.friendship.findMany);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/friends/requests", () => {
  it("비로그인 → 401", async () => {
    mockAuth.mockResolvedValue(null as never);

    const res = await GET();

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it("받은 요청이 없으면 {items: []}", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockFindMany.mockResolvedValue([]);

    const res = await GET();

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.items).toEqual([]);
  });

  it("받은 요청 → requester 정보 + friendshipId + createdAt 반환", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    const createdAt = new Date("2026-06-01T00:00:00Z");
    mockFindMany.mockResolvedValue([
      {
        id: "friendship-1",
        createdAt,
        requester: { id: "friend-1", username: "friend1", name: "친구1", image: null },
      },
    ] as never);

    const res = await GET();

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.items).toEqual([
      {
        friendshipId: "friendship-1",
        id: "friend-1",
        username: "friend1",
        name: "친구1",
        image: null,
        createdAt: createdAt.toISOString(),
      },
    ]);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { addresseeId: "user-1", status: "PENDING" } }),
    );
  });
});
