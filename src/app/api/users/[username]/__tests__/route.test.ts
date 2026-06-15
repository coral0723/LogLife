// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: { user: { findUnique: vi.fn() } },
}));

import { GET } from "../route";
import { prisma } from "@/lib/prisma";

const mockFindUnique = vi.mocked(prisma.user.findUnique);

const MOCK_USER = {
  id: "user-1",
  username: "amy",
  name: "에이미",
  image: null,
};

function makeProps(username: string) {
  return { params: Promise.resolve({ username }) };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/users/[username]", () => {
  it("존재하는 username → 200 + 공개 프로필 반환", async () => {
    mockFindUnique.mockResolvedValue(MOCK_USER as never);

    const res = await GET(new Request("http://localhost"), makeProps("amy"));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual(MOCK_USER);
  });

  it("username 조건으로 findUnique 호출", async () => {
    mockFindUnique.mockResolvedValue(MOCK_USER as never);

    await GET(new Request("http://localhost"), makeProps("amy"));

    expect(mockFindUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { username: "amy" } }),
    );
  });

  it("존재하지 않는 username → 404", async () => {
    mockFindUnique.mockResolvedValue(null as never);

    const res = await GET(new Request("http://localhost"), makeProps("ghost"));

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });
});
