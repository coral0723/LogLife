import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act, fireEvent } from "@testing-library/react";
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

function openDropdown() {
  fireEvent.click(screen.getByRole("button", { name: /친구/ }));
}

let capturedIOCallback: IntersectionObserverCallback | null = null;

beforeEach(() => {
  capturedIOCallback = null;
  vi.clearAllMocks();
  class MockIntersectionObserver {
    observe = vi.fn();
    disconnect = vi.fn();
    constructor(cb: IntersectionObserverCallback) {
      capturedIOCallback = cb;
    }
  }
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("FriendListSection", () => {
  it("친구가 없으면 배지 없이 헤더만 표시되고, 클릭하면 빈 상태 문구가 표시된다", async () => {
    mockFetchFriends.mockResolvedValue({ items: [], nextCursor: null, totalCount: 0 });
    renderSection();

    await waitFor(() => {
      expect(mockFetchFriends).toHaveBeenCalled();
    });

    expect(screen.getByText("친구")).toBeInTheDocument();
    expect(screen.queryByText("아직 친구가 없어요")).not.toBeInTheDocument();

    openDropdown();

    expect(await screen.findByText("아직 친구가 없어요")).toBeInTheDocument();
  });

  it("친구가 있으면 배지에 totalCount를 표시한다", async () => {
    mockFetchFriends.mockResolvedValue({
      items: [FRIEND_ITEM],
      nextCursor: null,
      totalCount: 3,
    });
    renderSection();

    expect(await screen.findByText("3")).toBeInTheDocument();
  });

  it("헤더 클릭으로 목록을 펼치고 접을 수 있다", async () => {
    mockFetchFriends.mockResolvedValue({
      items: [FRIEND_ITEM],
      nextCursor: null,
      totalCount: 1,
    });
    renderSection();

    await waitFor(() => expect(mockFetchFriends).toHaveBeenCalled());
    expect(screen.queryByText("앨리스")).not.toBeInTheDocument();

    openDropdown();
    expect(await screen.findByText("앨리스")).toBeInTheDocument();

    openDropdown();
    expect(screen.queryByText("앨리스")).not.toBeInTheDocument();
  });

  it("친구 목록을 이름/username과 함께 표시한다", async () => {
    mockFetchFriends.mockResolvedValue({
      items: [FRIEND_ITEM],
      nextCursor: null,
      totalCount: 1,
    });
    renderSection();
    openDropdown();

    expect(await screen.findByText("앨리스")).toBeInTheDocument();
    expect(screen.getByText("@alice")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/u/alice");
  });

  it("이름이 없으면 username을 표시한다", async () => {
    mockFetchFriends.mockResolvedValue({
      items: [{ ...FRIEND_ITEM, name: null }],
      nextCursor: null,
      totalCount: 1,
    });
    renderSection();
    openDropdown();

    expect(await screen.findByText("alice")).toBeInTheDocument();
    expect(screen.getByText("@alice")).toBeInTheDocument();
  });

  describe("무한 스크롤", () => {
    it("nextCursor가 있을 때 sentinel이 보이면 다음 페이지를 불러와 목록에 추가한다", async () => {
      const page2Item = { ...FRIEND_ITEM, friendshipId: "fs-2", id: "user-2", username: "bob", name: "보브" };
      mockFetchFriends
        .mockResolvedValueOnce({ items: [FRIEND_ITEM], nextCursor: "fs-1", totalCount: 11 })
        .mockResolvedValueOnce({ items: [page2Item], nextCursor: null, totalCount: 11 });

      renderSection();
      openDropdown();

      await waitFor(() => {
        expect(screen.getByText("앨리스")).toBeInTheDocument();
        expect(capturedIOCallback).not.toBeNull();
      });

      await act(async () => {
        capturedIOCallback!(
          [{ isIntersecting: true } as IntersectionObserverEntry],
          {} as IntersectionObserver,
        );
      });

      await waitFor(() => {
        expect(screen.getByText("앨리스")).toBeInTheDocument();
        expect(screen.getByText("보브")).toBeInTheDocument();
      });

      expect(mockFetchFriends).toHaveBeenCalledTimes(2);
      expect(mockFetchFriends).toHaveBeenLastCalledWith("fs-1");
    });

    it("isIntersecting: false일 때 추가 fetch 없음", async () => {
      mockFetchFriends.mockResolvedValue({
        items: [FRIEND_ITEM],
        nextCursor: "fs-1",
        totalCount: 11,
      });

      renderSection();
      openDropdown();

      await waitFor(() => {
        expect(screen.getByText("앨리스")).toBeInTheDocument();
        expect(capturedIOCallback).not.toBeNull();
      });

      await act(async () => {
        capturedIOCallback!(
          [{ isIntersecting: false } as IntersectionObserverEntry],
          {} as IntersectionObserver,
        );
      });

      expect(mockFetchFriends).toHaveBeenCalledTimes(1);
    });
  });
});
