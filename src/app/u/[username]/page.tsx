import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { auth } from "@/auth";
import { buildCountryPins } from "@/lib/countryPins";
import { AVATAR_PATHS } from "@/lib/avatar";
import { getViewableVisibilities } from "@/lib/bucketList/visibility";
import { getFriendRelation, type FriendRelation } from "@/lib/friend/relation";
import { prisma } from "@/lib/prisma";
import { GlobeClient } from "@/app/(afterLogin)/main/_components/GlobeClient";
import { StarField } from "@/app/(afterLogin)/main/_components/StarField";
import { ShareProfileButton } from "./_components/ShareProfileButton";
import { UserPageHeader } from "./_components/UserPageHeader";

type Props = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { username } = await props.params;

  const target = await prisma.user.findUnique({
    where: { username },
    select: { username: true, name: true, image: true },
  });
  if (!target) return {};

  const title = `${target.name ?? target.username}의 버킷리스트 | LogLife`;
  const description = "LogLife에서 버킷리스트를 확인해보세요.";
  const image = target.image ?? AVATAR_PATHS[0];

  return {
    title,
    description,
    openGraph: { title, description, images: [image] },
    twitter: { card: "summary", title, description, images: [image] },
  };
}

export default async function UserPage(props: Props) {
  const { username } = await props.params;

  const target = await prisma.user.findUnique({
    where: { username },
    select: { id: true, username: true, name: true, image: true },
  });
  if (!target) notFound();

  const session = await auth();
  const viewerId = session?.user?.id;
  const isSelf = viewerId === target.id;
  const relation: FriendRelation = isSelf
    ? "friends"
    : viewerId
      ? await getFriendRelation(viewerId, target.id)
      : "none";
  const isFriend = relation === "friends";
  const visibilities = getViewableVisibilities(isSelf || isFriend);

  const [byCountry, byAchieved, byExpired] = await Promise.all([
    prisma.bucketList.groupBy({
      by: ["countryCode"],
      where: { userId: target.id, visibility: { in: visibilities } },
      _count: { _all: true },
    }),
    prisma.bucketList.groupBy({
      by: ["countryCode"],
      where: { userId: target.id, visibility: { in: visibilities }, achieved: true },
      _count: { _all: true },
    }),
    prisma.bucketList.groupBy({
      by: ["countryCode"],
      where: {
        userId: target.id,
        visibility: { in: visibilities },
        achieved: false,
        deadlineAt: { lt: new Date(new Date().setUTCHours(0, 0, 0, 0)) },
      },
      _count: { _all: true },
    }),
  ]);

  const pins = buildCountryPins(byCountry, byAchieved, byExpired);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: target.name ?? target.username,
    image: target.image ?? AVATAR_PATHS[0],
    url: `/u/${target.username}`,
  };

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-[#060d1f]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <StarField />
      <GlobeClient pins={pins} username={target.username} />

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-44 bg-linear-to-t from-[#060d1f]/70 to-transparent" />
      <UserPageHeader
        username={target.username}
        targetUser={target}
        isLoggedIn={!!viewerId}
        relation={relation}
        isSelf={isSelf}
      />
      <ShareProfileButton username={target.username} />
    </main>
  );
}
