"use client"

import { useEffect, useState } from "react";

export default function OfflineOverlay() {
  const [isOffline, setIsOffline] = useState(() =>
    typeof navigator === "undefined" ? false : !navigator.onLine
  );

  useEffect(() => {
    if (!navigator.onLine) document.body.style.overflow = "hidden";

    const handleOffline = () => {
      setIsOffline(true);
      document.body.style.overflow = "hidden";
    };
    const handleOnline = () => {
      setIsOffline(false);
      document.body.style.overflow = "";
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      document.body.style.overflow = "";
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="rounded-full bg-[#2cc2f7]/10 p-5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 256 256"
            fill="#2cc2f7"
            aria-hidden="true"
          >
            <path d="M228,208a12,12,0,0,1-10.39,6H38.39A12,12,0,0,1,28,196l89.61-155.18a12,12,0,0,1,20.78,0ZM120,104v40a8,8,0,0,0,16,0V104a8,8,0,0,0-16,0Zm18,72a10,10,0,1,0-10,10A10,10,0,0,0,138,176Z" />
          </svg>
        </div>
        <p className="text-lg font-semibold text-white">인터넷 연결이 없습니다</p>
        <p className="text-sm text-zinc-400">연결이 복구되면 자동으로 계속됩니다</p>
      </div>
    </div>
  );
}
