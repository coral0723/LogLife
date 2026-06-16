import { prisma } from "@/lib/prisma";

export type FriendRelation = "none" | "pending_sent" | "pending_received" | "friends";

// status=ACCEPTED인 Friendship이 양방향(requester/addressee) 어느 쪽이든 존재하는지 확인
export async function areFriends(userIdA: string, userIdB: string): Promise<boolean> {
  const friendship = await prisma.friendship.findFirst({
    where: {
      status: "ACCEPTED",
      OR: [
        { requesterId: userIdA, addresseeId: userIdB },
        { requesterId: userIdB, addresseeId: userIdA },
      ],
    },
    select: { id: true },
  });

  return friendship !== null;
}

// viewer 기준으로 target과의 관계 상태를 판정
export async function getFriendRelation(
  viewerId: string,
  targetId: string,
): Promise<FriendRelation> {
  const friendship = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: viewerId, addresseeId: targetId },
        { requesterId: targetId, addresseeId: viewerId },
      ],
    },
    select: { requesterId: true, status: true },
  });

  if (!friendship) return "none";
  if (friendship.status === "ACCEPTED") return "friends";
  return friendship.requesterId === viewerId ? "pending_sent" : "pending_received";
}
