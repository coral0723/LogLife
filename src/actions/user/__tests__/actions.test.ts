// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: { user: { update: vi.fn() } },
}));

import { updateAvatar } from "../actions";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AVATAR_PATHS } from "@/lib/avatar";

const mockAuth = vi.mocked(auth);
const mockUpdate = vi.mocked(prisma.user.update);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("updateAvatar", () => {
  it("비로그인 → 에러, prisma 호출 안 됨", async () => {
    mockAuth.mockResolvedValue(null as never);

    await expect(updateAvatar(AVATAR_PATHS[1])).rejects.toThrow("로그인이 필요합니다.");
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("정상 요청 → 본인 user row의 image 갱신", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockUpdate.mockResolvedValue({ image: AVATAR_PATHS[2] } as never);

    const result = await updateAvatar(AVATAR_PATHS[2]);

    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { image: AVATAR_PATHS[2] },
      select: { image: true },
    });
    expect(result).toEqual({ image: AVATAR_PATHS[2] });
  });

  it("AVATAR_PATHS에 없는 값 → zod 검증 에러, prisma 호출 안 됨", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);

    await expect(updateAvatar("/avatars/invalid.png")).rejects.toThrow();
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});
