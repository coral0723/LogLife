import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-full flex-col items-center justify-center bg-black">
      <Link
        href="/login"
        className="rounded-full border border-white/20 px-8 py-3 text-sm text-white/80 transition hover:border-white/50 hover:text-white"
      >
        로그인 버튼
      </Link>
    </main>
  );
}
