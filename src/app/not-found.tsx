import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 bg-[#060d1f] px-6 text-center">
      <p className="text-sm tracking-widest text-white/40">404</p>
      <h1 className="max-w-md text-2xl font-semibold tracking-tight text-white md:text-3xl">
        여기는 아직 핀이 꽂히지 않은 곳이에요
      </h1>
      <p className="max-w-sm text-sm leading-relaxed text-white/50">
        주소를 다시 확인하거나, 처음으로 돌아가 보세요.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-full border border-white/20 px-8 py-3 text-sm text-white/80 transition hover:border-white/50 hover:text-white"
      >
        처음으로 돌아가기
      </Link>
    </main>
  );
}
