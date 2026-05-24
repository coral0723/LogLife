import { redirect } from "next/navigation";

import { auth } from "@/auth";

import { CreateBucketListForm } from "./CreateForm";

export default async function CreateBucketListPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">버킷리스트 작성</h1>
      <CreateBucketListForm />
    </main>
  );
}
