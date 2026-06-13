// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: { user: { update: vi.fn(), findFirst: vi.fn() } },
}));

import { updateAvatar, updateNickname } from "../actions";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AVATAR_PATHS } from "@/lib/avatar";

const mockAuth = vi.mocked(auth);
const mockUpdate = vi.mocked(prisma.user.update);
const mockFindFirst = vi.mocked(prisma.user.findFirst);

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

describe("updateNickname", () => {
  it("비로그인 → 에러, prisma 호출 안 됨", async () => {
    mockAuth.mockResolvedValue(null as never);

    await expect(updateNickname("새닉네임")).rejects.toThrow("로그인이 필요합니다.");
    expect(mockFindFirst).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("중복 없음 → 본인 user row의 name 갱신", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockFindFirst.mockResolvedValue(null);
    mockUpdate.mockResolvedValue({ name: "새닉네임" } as never);

    const result = await updateNickname("새닉네임");

    expect(mockFindFirst).toHaveBeenCalledWith({
      where: { name: "새닉네임", NOT: { id: "user-1" } },
      select: { id: true },
    });
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { name: "새닉네임" },
      select: { name: true },
    });
    expect(result).toEqual({ name: "새닉네임" });
  });

  it("이미 다른 유저가 사용 중인 닉네임 → 에러, update 미호출", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockFindFirst.mockResolvedValue({ id: "user-2" } as never);

    await expect(updateNickname("중복닉네임")).rejects.toThrow("이미 존재하는 닉네임입니다.");
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("공백만 입력 → zod 검증 에러, prisma 호출 안 됨", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);

    await expect(updateNickname("   ")).rejects.toThrow();
    expect(mockFindFirst).not.toHaveBeenCalled();
  });

  it("16자 이상 → zod 검증 에러, prisma 호출 안 됨", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);

    await expect(updateNickname("가".repeat(16))).rejects.toThrow();
    expect(mockFindFirst).not.toHaveBeenCalled();
  });
});
