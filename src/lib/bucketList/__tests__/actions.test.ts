// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: { bucketList: { updateMany: vi.fn() } },
}));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  updateTag: vi.fn(),
}));

import { updateDeadline } from "../actions";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const mockAuth = vi.mocked(auth);
const mockUpdateMany = vi.mocked(prisma.bucketList.updateMany);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("updateDeadline", () => {
  it("비로그인 → 에러", async () => {
    mockAuth.mockResolvedValue(null as never);

    await expect(
      updateDeadline("item-1", new Date("2030-01-01T00:00:00.000Z")),
    ).rejects.toThrow("로그인이 필요합니다.");
    expect(mockUpdateMany).not.toHaveBeenCalled();
  });

  it("본인 소유 → 마감일 갱신 성공 (ownership guard: where에 { id, userId })", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockUpdateMany.mockResolvedValue({ count: 1 } as never);

    const result = await updateDeadline(
      "item-1",
      new Date("2030-01-01T00:00:00.000Z"),
    );

    expect(mockUpdateMany).toHaveBeenCalledWith({
      where: { id: "item-1", userId: "user-1" },
      data: { deadlineAt: new Date("2030-01-01T00:00:00.000Z") },
    });
    expect(result).toEqual({ deadlineAt: new Date("2030-01-01T00:00:00.000Z") });
  });

  it("타인 소유 (또는 없는 id) → count 0 → 에러", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockUpdateMany.mockResolvedValue({ count: 0 } as never);

    await expect(
      updateDeadline("other-user-item", new Date("2030-01-01T00:00:00.000Z")),
    ).rejects.toThrow("수정할 버킷리스트를 찾을 수 없습니다.");
  });

  it("deadlineAt: null → 마감일 해제 처리", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockUpdateMany.mockResolvedValue({ count: 1 } as never);

    const result = await updateDeadline("item-1", null);

    expect(mockUpdateMany).toHaveBeenCalledWith({
      where: { id: "item-1", userId: "user-1" },
      data: { deadlineAt: null },
    });
    expect(result).toEqual({ deadlineAt: null });
  });
});
