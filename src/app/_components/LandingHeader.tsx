import Image from "next/image";
import Link from "next/link";

export function LandingHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-sm bg-black/30">
      <Link href="/" className="flex items-center gap-2">
        <Image src="/logo.png" alt="LogLife" width={28} height={28} />
        <span className="text-sm font-semibold text-white">LogLife</span>
      </Link>

      <Link
        href="/login"
        className="rounded-full bg-[#2cc2f7] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#1aade0]"
      >
        Log In
      </Link>
    </header>
  );
}
