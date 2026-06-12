import Link from "next/link";
import { X } from "@phosphor-icons/react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { ProfileSettingsView } from "./_components/ProfileSettingsView";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="relative flex min-h-dvh flex-col bg-white">
      <Link
        href="/main"
        aria-label="닫기"
        className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
      >
        <X size={20} weight="bold" />
      </Link>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <ProfileSettingsView />
      </div>
    </div>
  );
}
