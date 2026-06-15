// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: { bucketList: { findUnique: vi.fn() } },
}));
vi.mock("@/lib/friend/relation", () => ({ areFriends: vi.fn() }));

import { GET } from "../route";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { areFriends } from "@/lib/friend/relation";

const mockAuth = vi.mocked(auth);
const mockFindUnique = vi.mocked(prisma.bucketList.findUnique);
const mockAreFriends = vi.mocked(areFriends);

const OWNER_USER = { username: "owner", name: "오너", image: null };

function makeItem(overrides: Partial<{ visibility: "PUBLIC" | "FRIENDS" | "PRIVATE" }> = {}) {
  return {
    id: "item-1",
    title: "도쿄 라멘 골목 탐방",
    description: null,
    visibility: "PUBLIC" as const,
    deadlineAt: null,
    achievedAt: null,
    difficulty: 2,
    excitement: 5,
    achieved: false,
    placeId: "ChIJ1111",
    displayName: "신주쿠구",
    countryCode: "JP",
    shareToken: "abc123",
    userId: "owner-1",
    user: OWNER_USER,
    ...overrides,
  };
}

function makeProps(id: string) {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/bucketlists/[id]", () => {
  it("존재하지 않는 아이템 → 404", async () => {
    mockAuth.mockResolvedValue(null as never);
    mockFindUnique.mockResolvedValue(null as never);

    const res = await GET(new Request("http://localhost"), makeProps("missing"));

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it("조회 시 { where: { id } }로 단건 조회", async () => {
    mockAuth.mockResolvedValue(null as never);
    mockFindUnique.mockResolvedValue(makeItem() as never);

    await GET(new Request("http://localhost"), makeProps("item-1"));

    expect(mockFindUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "item-1" } }),
    );
  });

  it("비로그인 + PUBLIC → 200, userId 제외 + user 포함", async () => {
    mockAuth.mockResolvedValue(null as never);
    mockFindUnique.mockResolvedValue(makeItem({ visibility: "PUBLIC" }) as never);

    const res = await GET(new Request("http://localhost"), makeProps("item-1"));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.userId).toBeUndefined();
    expect(body.user).toEqual(OWNER_USER);
  });

  it("비로그인 + PRIVATE → 404", async () => {
    mockAuth.mockResolvedValue(null as never);
    mockFindUnique.mockResolvedValue(makeItem({ visibility: "PRIVATE" }) as never);

    const res = await GET(new Request("http://localhost"), makeProps("item-1"));

    expect(res.status).toBe(404);
  });

  it("비로그인 + FRIENDS → 404", async () => {
    mockAuth.mockResolvedValue(null as never);
    mockFindUnique.mockResolvedValue(makeItem({ visibility: "FRIENDS" }) as never);

    const res = await GET(new Request("http://localhost"), makeProps("item-1"));

    expect(res.status).toBe(404);
  });

  it("소유자 → PRIVATE 아이템도 200", async () => {
    mockAuth.mockResolvedValue({ user: { id: "owner-1" } } as never);
    mockFindUnique.mockResolvedValue(makeItem({ visibility: "PRIVATE" }) as never);

    const res = await GET(new Request("http://localhost"), makeProps("item-1"));

    expect(res.status).toBe(200);
    expect(mockAreFriends).not.toHaveBeenCalled();
  });

  it("비소유자(비친구) + PUBLIC → 200", async () => {
    mockAuth.mockResolvedValue({ user: { id: "viewer-1" } } as never);
    mockFindUnique.mockResolvedValue(makeItem({ visibility: "PUBLIC" }) as never);
    mockAreFriends.mockResolvedValue(false);

    const res = await GET(new Request("http://localhost"), makeProps("item-1"));

    expect(res.status).toBe(200);
  });

  it("비소유자(비친구) + PRIVATE → 404", async () => {
    mockAuth.mockResolvedValue({ user: { id: "viewer-1" } } as never);
    mockFindUnique.mockResolvedValue(makeItem({ visibility: "PRIVATE" }) as never);
    mockAreFriends.mockResolvedValue(false);

    const res = await GET(new Request("http://localhost"), makeProps("item-1"));

    expect(res.status).toBe(404);
  });

  it("비소유자(비친구) + FRIENDS → 404", async () => {
    mockAuth.mockResolvedValue({ user: { id: "viewer-1" } } as never);
    mockFindUnique.mockResolvedValue(makeItem({ visibility: "FRIENDS" }) as never);
    mockAreFriends.mockResolvedValue(false);

    const res = await GET(new Request("http://localhost"), makeProps("item-1"));

    expect(res.status).toBe(404);
  });

  it("비소유자(친구) + FRIENDS → 200", async () => {
    mockAuth.mockResolvedValue({ user: { id: "viewer-1" } } as never);
    mockFindUnique.mockResolvedValue(makeItem({ visibility: "FRIENDS" }) as never);
    mockAreFriends.mockResolvedValue(true);

    const res = await GET(new Request("http://localhost"), makeProps("item-1"));

    expect(res.status).toBe(200);
    expect(mockAreFriends).toHaveBeenCalledWith("viewer-1", "owner-1");
  });
});
