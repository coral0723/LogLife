import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { UserProfileModalClient } from "./_components/UserProfileModalClient";

type Props = {
  params: Promise<{ username: string }>;
};

export default async function UserProfileModalPage(props: Props) {
  const { username } = await props.params;

  const target = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });
  if (!target) notFound();

  return <UserProfileModalClient username={username} />;
}
