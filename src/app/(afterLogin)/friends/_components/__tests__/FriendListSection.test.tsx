import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { FriendListSection } from "../FriendListSection";
import { fetchFriends } from "@/api/friends";

vi.mock("@/api/friends", () => ({
  fetchFriends: vi.fn(),
  friendQueryKeys: {
    list: () => ["friends", "list"],
  },
}));

const mockFetchFriends = vi.mocked(fetchFriends);

const FRIEND_ITEM = {
  friendshipId: "fs-1",
  id: "user-1",
  username: "alice",
  name: "앨리스",
  image: null,
};

function renderSection() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(<FriendListSection />, { wrapper: Wrapper });
}

describe("FriendListSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("친구가 없으면 빈 상태 문구를 표시한다", async () => {
    mockFetchFriends.mockResolvedValue([]);
    renderSection();

    await waitFor(() => {
      expect(mockFetchFriends).toHaveBeenCalled();
    });

    expect(await screen.findByText("아직 친구가 없어요")).toBeInTheDocument();
  });

  it("친구 목록을 이름/username과 함께 표시한다", async () => {
    mockFetchFriends.mockResolvedValue([FRIEND_ITEM]);
    renderSection();

    expect(await screen.findByText("앨리스")).toBeInTheDocument();
    expect(screen.getByText("@alice")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/u/alice");
  });

  it("이름이 없으면 username을 표시한다", async () => {
    mockFetchFriends.mockResolvedValue([{ ...FRIEND_ITEM, name: null }]);
    renderSection();

    expect(await screen.findByText("alice")).toBeInTheDocument();
    expect(screen.getByText("@alice")).toBeInTheDocument();
  });
});
