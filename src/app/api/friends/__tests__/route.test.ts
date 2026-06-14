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

describe("GET /api/friends", () => {
  it("비로그인 → 401", async () => {
    mockAuth.mockResolvedValue(null as never);

    const res = await GET();

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it("친구가 없으면 {items: []}", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockFindMany.mockResolvedValue([]);

    const res = await GET();

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.items).toEqual([]);
  });

  it("requester/addressee 구분 + username 오름차순 정렬", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockFindMany.mockResolvedValue([
      {
        id: "friendship-1",
        requesterId: "user-1",
        addresseeId: "friend-z",
        requester: { id: "user-1", username: "me", name: "나", image: null },
        addressee: { id: "friend-z", username: "zara", name: "자라", image: null },
      },
      {
        id: "friendship-2",
        requesterId: "friend-a",
        addresseeId: "user-1",
        requester: { id: "friend-a", username: "amy", name: "에이미", image: null },
        addressee: { id: "user-1", username: "me", name: "나", image: null },
      },
    ] as never);

    const res = await GET();

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.items).toEqual([
      { friendshipId: "friendship-2", id: "friend-a", username: "amy", name: "에이미", image: null },
      { friendshipId: "friendship-1", id: "friend-z", username: "zara", name: "자라", image: null },
    ]);
  });
});
