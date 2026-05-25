import { redirect } from "next/navigation";

import { auth } from "@/auth";

import { BottomNav } from "./_components/BottomNav";

export default async function AfterLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="relative min-h-[100dvh] bg-[#08090d]">
      {children}
      <BottomNav />
    </div>
  );
}
