import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ProfileModalClient } from "./_components/ProfileModalClient";

export default async function ProfileModalPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return <ProfileModalClient />;
}
