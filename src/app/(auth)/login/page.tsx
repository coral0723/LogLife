import { signIn } from "@/auth";

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <form
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/" });
        }}
        className="flex flex-col gap-4"
      >
        <h1 className="text-2xl font-semibold">LogLife</h1>
        <button
          type="submit"
          className="rounded border border-neutral-300 px-4 py-2 hover:bg-neutral-100"
        >
          Google로 시작하기
        </button>
      </form>
    </main>
  );
}
