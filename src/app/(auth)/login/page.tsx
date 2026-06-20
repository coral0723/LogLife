import Image from "next/image";
import { signIn } from "@/auth";
import { StarField } from "@/app/(afterLogin)/main/_components/StarField";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center bg-black p-6">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-50">
        <StarField />
      </div>

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-8 rounded-2xl border border-white/10 bg-white/5 p-10 backdrop-blur-md">
        <div className="flex flex-col items-center gap-3">
          <Image src="/logo.png" alt="LogLife 로고" width={48} height={48} />
          <span className="text-xl font-bold text-white">LogLife</span>
        </div>

        <p className="text-center text-sm text-white/60">
          당신의 이야기를 지구에 새겨보세요
        </p>

        <div className="flex w-full flex-col gap-3">
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/main" });
            }}
          >
            <button
              type="submit"
              className="flex w-full items-center cursor-pointer justify-center gap-3 rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17.64 9.205c0-.638-.057-1.252-.164-1.841H9v3.48h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.614Z"
                  fill="#4285F4"
                />
                <path
                  d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18Z"
                  fill="#34A853"
                />
                <path
                  d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
                  fill="#FBBC05"
                />
                <path
                  d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.892 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
                  fill="#EA4335"
                />
              </svg>
              Google로 계속하기
            </button>
          </form>

          <form
            action={async () => {
              "use server";
              await signIn("kakao", { redirectTo: "/main" });
            }}
          >
          <button
            type="submit"
            className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-full bg-[#FEE500] px-6 py-3 text-sm font-semibold text-[#191919] transition hover:bg-[#F0D800]"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M9 1C4.306 1 .5 4.01.5 7.75c0 2.392 1.487 4.497 3.75 5.74l-.89 3.326a.375.375 0 0 0 .573.406L7.97 14.99A10.2 10.2 0 0 0 9 15.063c4.694 0 8.5-2.966 8.5-6.688 0-3.74-3.806-6.75-8.5-6.75Z"
                fill="#191919"
              />
            </svg>
            카카오로 계속하기
          </button>
          </form>
        </div>

        <p className="text-center text-xs text-white/40">
          로그인 시 서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
        </p>
      </div>
    </main>
  );
}
