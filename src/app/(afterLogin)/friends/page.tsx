import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { FriendsCloseLink } from "./_components/FriendsCloseLink";
import { FriendsView } from "./_components/FriendsView";

export default async function FriendsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="relative flex min-h-dvh flex-col bg-white">
      <FriendsCloseLink />
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <FriendsView />
      </div>
    </div>
  );
}
