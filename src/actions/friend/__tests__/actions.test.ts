// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    friendship: {
      findFirst: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
      updateMany: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

import {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
} from "../actions";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const mockAuth = vi.mocked(auth);
const mockFindFirst = vi.mocked(prisma.friendship.findFirst);
const mockUpdate = vi.mocked(prisma.friendship.update);
const mockCreate = vi.mocked(prisma.friendship.create);
const mockUpdateMany = vi.mocked(prisma.friendship.updateMany);
const mockDeleteMany = vi.mocked(prisma.friendship.deleteMany);

const NOW = new Date("2026-06-14T00:00:00.000Z");

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("sendFriendRequest", () => {
  it("비로그인 → 에러", async () => {
    mockAuth.mockResolvedValue(null as never);

    await expect(sendFriendRequest("user-2")).rejects.toThrow("로그인이 필요합니다.");
    expect(mockFindFirst).not.toHaveBeenCalled();
  });

  it("자기자신에게 요청 → 에러", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);

    await expect(sendFriendRequest("user-1")).rejects.toThrow(
      "자신에게는 친구 요청을 보낼 수 없습니다.",
    );
    expect(mockFindFirst).not.toHaveBeenCalled();
  });

  it("이미 친구(ACCEPTED) → 에러", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockFindFirst.mockResolvedValue({
      id: "friendship-1",
      requesterId: "user-1",
      addresseeId: "user-2",
      status: "ACCEPTED",
    } as never);

    await expect(sendFriendRequest("user-2")).rejects.toThrow("이미 친구입니다.");
    expect(mockUpdate).not.toHaveBeenCalled();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("이미 요청을 보낸 상태(PENDING, requester=본인) → 에러", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockFindFirst.mockResolvedValue({
      id: "friendship-1",
      requesterId: "user-1",
      addresseeId: "user-2",
      status: "PENDING",
    } as never);

    await expect(sendFriendRequest("user-2")).rejects.toThrow(
      "이미 요청을 보냈습니다.",
    );
    expect(mockUpdate).not.toHaveBeenCalled();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("상대방이 이미 보낸 PENDING 요청 존재 → 자동 ACCEPTED", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockFindFirst.mockResolvedValue({
      id: "friendship-1",
      requesterId: "user-2",
      addresseeId: "user-1",
      status: "PENDING",
    } as never);
    mockUpdate.mockResolvedValue({} as never);

    const result = await sendFriendRequest("user-2");

    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "friendship-1" },
      data: { status: "ACCEPTED", respondedAt: NOW },
    });
    expect(mockCreate).not.toHaveBeenCalled();
    expect(result).toEqual({ status: "ACCEPTED" });
  });

  it("기존 관계 없음 → 신규 생성 (PENDING)", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockFindFirst.mockResolvedValue(null);
    mockCreate.mockResolvedValue({} as never);

    const result = await sendFriendRequest("user-2");

    expect(mockFindFirst).toHaveBeenCalledWith({
      where: {
        OR: [
          { requesterId: "user-1", addresseeId: "user-2" },
          { requesterId: "user-2", addresseeId: "user-1" },
        ],
      },
    });
    expect(mockCreate).toHaveBeenCalledWith({
      data: { requesterId: "user-1", addresseeId: "user-2", status: "PENDING" },
    });
    expect(result).toEqual({ status: "PENDING" });
  });
});

describe("acceptFriendRequest", () => {
  it("비로그인 → 에러", async () => {
    mockAuth.mockResolvedValue(null as never);

    await expect(acceptFriendRequest("friendship-1")).rejects.toThrow(
      "로그인이 필요합니다.",
    );
    expect(mockUpdateMany).not.toHaveBeenCalled();
  });

  it("수신자 본인 + PENDING → 수락 성공 (ownership guard)", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockUpdateMany.mockResolvedValue({ count: 1 } as never);

    await acceptFriendRequest("friendship-1");

    expect(mockUpdateMany).toHaveBeenCalledWith({
      where: { id: "friendship-1", addresseeId: "user-1", status: "PENDING" },
      data: { status: "ACCEPTED", respondedAt: NOW },
    });
  });

  it("타인 요청 또는 존재하지 않음 (count 0) → 에러", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockUpdateMany.mockResolvedValue({ count: 0 } as never);

    await expect(acceptFriendRequest("friendship-1")).rejects.toThrow(
      "요청을 찾을 수 없습니다.",
    );
  });
});

describe("declineFriendRequest", () => {
  it("비로그인 → 에러", async () => {
    mockAuth.mockResolvedValue(null as never);

    await expect(declineFriendRequest("friendship-1")).rejects.toThrow(
      "로그인이 필요합니다.",
    );
    expect(mockDeleteMany).not.toHaveBeenCalled();
  });

  it("수신자 본인 + PENDING → 거절 성공 (ownership guard)", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockDeleteMany.mockResolvedValue({ count: 1 } as never);

    await declineFriendRequest("friendship-1");

    expect(mockDeleteMany).toHaveBeenCalledWith({
      where: { id: "friendship-1", addresseeId: "user-1", status: "PENDING" },
    });
  });

  it("타인 요청 또는 존재하지 않음 (count 0) → 에러", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockDeleteMany.mockResolvedValue({ count: 0 } as never);

    await expect(declineFriendRequest("friendship-1")).rejects.toThrow(
      "요청을 찾을 수 없습니다.",
    );
  });
});
