import type { ComponentProps } from "react";

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { FriendBadge } from "../FriendBadge";
import { fetchFriendRequestsCount } from "@/api/friends";

vi.mock("@/api/friends", () => ({
  fetchFriendRequestsCount: vi.fn(),
  friendQueryKeys: {
    requestsCount: () => ["friends", "requests", "count"],
  },
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: ComponentProps<"a">) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const mockFetchFriendRequestsCount = vi.mocked(fetchFriendRequestsCount);

function renderBadge() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(<FriendBadge />, { wrapper: Wrapper });
}

describe("FriendBadge", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("/friends로 이동하는 링크를 렌더링한다", async () => {
    mockFetchFriendRequestsCount.mockResolvedValue(0);
    renderBadge();

    expect(await screen.findByRole("link")).toHaveAttribute("href", "/friends");
  });

  it("받은 친구 요청이 없으면 빨간 점을 표시하지 않는다", async () => {
    mockFetchFriendRequestsCount.mockResolvedValue(0);
    renderBadge();

    await waitFor(() => expect(mockFetchFriendRequestsCount).toHaveBeenCalled());
    expect(screen.queryByLabelText("새 친구 요청 있음")).not.toBeInTheDocument();
  });

  it("받은 친구 요청이 있으면 빨간 점을 표시한다", async () => {
    mockFetchFriendRequestsCount.mockResolvedValue(2);
    renderBadge();

    expect(await screen.findByLabelText("새 친구 요청 있음")).toBeInTheDocument();
  });
});
