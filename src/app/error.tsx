"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 bg-[#060d1f] px-6 text-center">
      <p className="text-sm tracking-widest text-white/40">ERROR</p>
      <h1 className="max-w-md text-2xl font-semibold tracking-tight text-white md:text-3xl">
        잠시 길을 잃은 것 같아요
      </h1>
      <p className="max-w-sm text-sm leading-relaxed text-white/50">
        페이지를 불러오는 중 예기치 않은 문제가 생겼어요. 다시 시도해 주세요.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-2 rounded-full border border-white/20 px-8 py-3 text-sm text-white/80 transition hover:border-white/50 hover:text-white active:scale-[0.98]"
      >
        다시 시도하기
      </button>
    </main>
  );
}
