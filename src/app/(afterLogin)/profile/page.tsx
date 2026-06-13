import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ProfileCloseLink } from "./_components/ProfileCloseLink";
import { ProfileSettingsView } from "./_components/ProfileSettingsView";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="relative flex min-h-dvh flex-col bg-white">
      <ProfileCloseLink />
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <ProfileSettingsView />
      </div>
    </div>
  );
}
