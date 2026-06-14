"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MagnifyingGlass } from "@phosphor-icons/react";

import { friendQueryKeys, searchUsers } from "@/api/friends";
import LoadingSpinner from "@/app/(afterLogin)/_components/LoadingSpinner";
import { UserSearchResultItem } from "./UserSearchResultItem";

const DEBOUNCE_MS = 300;
const TOAST_DURATION_MS = 2000;

export function UserSearchSection() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const { data, isLoading } = useQuery({
    queryKey: friendQueryKeys.search(debouncedQuery),
    queryFn: () => searchUsers(debouncedQuery),
    enabled: debouncedQuery.length > 0,
  });

  const items = data ?? [];

  const handleSendSuccess = (status: "PENDING" | "ACCEPTED") => {
    setToastMessage(status === "ACCEPTED" ? "친구가 되었습니다" : "요청을 보냈습니다");
  };

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-sm font-medium text-zinc-500">친구 찾기</h3>
      <div className="relative">
        <MagnifyingGlass
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="이름 또는 아이디로 검색"
          className="w-full rounded-xl border border-zinc-200 py-2.5 pl-9 pr-3 text-sm focus:outline-none"
        />
      </div>

      {toastMessage && (
        <div className="rounded-xl bg-zinc-900 px-4 py-2 text-center text-sm text-white">
          {toastMessage}
        </div>
      )}

      {debouncedQuery.length > 0 && (
        <div>
          {isLoading ? (
            <div className="flex h-20 items-center justify-center">
              <LoadingSpinner size="xs" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex h-20 items-center justify-center rounded-2xl border border-zinc-100 bg-zinc-50 text-sm text-zinc-400">
              검색 결과가 없습니다
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {items.map((user) => (
                <UserSearchResultItem
                  key={user.id}
                  user={user}
                  searchQuery={debouncedQuery}
                  onSendSuccess={handleSendSuccess}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
