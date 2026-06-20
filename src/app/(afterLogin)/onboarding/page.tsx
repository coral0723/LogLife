import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import { OnboardingClient } from "@/components/onboarding/OnboardingClient";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isOnboarded: true },
  });
  if (!user) redirect("/login");
  if (user.isOnboarded) redirect("/main");

  return <OnboardingClient />;
}
