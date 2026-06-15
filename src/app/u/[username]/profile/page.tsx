import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { ProfileCloseLink } from "@/app/(afterLogin)/profile/_components/ProfileCloseLink";
import { PublicProfileView } from "../_components/PublicProfileView";

type Props = {
  params: Promise<{ username: string }>;
};

export default async function UserProfilePage(props: Props) {
  const { username } = await props.params;

  const target = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });
  if (!target) notFound();

  return (
    <div className="relative flex min-h-dvh flex-col bg-white">
      <ProfileCloseLink href={`/u/${username}`} />
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <PublicProfileView username={username} />
      </div>
    </div>
  );
}
