import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { FriendsModalClient } from "./_components/FriendsModalClient";

export default async function FriendsModalPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return <FriendsModalClient />;
}
