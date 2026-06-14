import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { FriendRequestsSection } from "../FriendRequestsSection";
import { fetchFriendRequests } from "@/api/friends";
import { acceptFriendRequest, declineFriendRequest } from "@/actions/friend/actions";

vi.mock("@/api/friends", () => ({
  fetchFriendRequests: vi.fn(),
  friendQueryKeys: {
    requests: () => ["friends", "requests"],
    list: () => ["friends", "list"],
  },
}));

vi.mock("@/actions/friend/actions", () => ({
  acceptFriendRequest: vi.fn(),
  declineFriendRequest: vi.fn(),
}));

const mockFetchFriendRequests = vi.mocked(fetchFriendRequests);
const mockAcceptFriendRequest = vi.mocked(acceptFriendRequest);
const mockDeclineFriendRequest = vi.mocked(declineFriendRequest);

const REQUEST_ITEM = {
  friendshipId: "fs-1",
  id: "user-1",
  username: "alice",
  name: "앨리스",
  image: null,
  createdAt: "2026-06-01T00:00:00Z",
};

function renderSection() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(<FriendRequestsSection />, { wrapper: Wrapper });
}

function openDropdown() {
  fireEvent.click(screen.getByRole("button", { name: /받은 친구 요청/ }));
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

describe("FriendRequestsSection", () => {
  it("받은 요청이 없으면 배지 없이 헤더만 표시되고, 클릭하면 빈 상태 문구가 표시된다", async () => {
    mockFetchFriendRequests.mockResolvedValue({ items: [], nextCursor: null, totalCount: 0 });
    renderSection();

    await waitFor(() => {
      expect(mockFetchFriendRequests).toHaveBeenCalled();
    });

    expect(screen.getByText("받은 친구 요청")).toBeInTheDocument();
    expect(screen.queryByText("받은 요청이 없습니다")).not.toBeInTheDocument();

    openDropdown();

    expect(await screen.findByText("받은 요청이 없습니다")).toBeInTheDocument();
  });

  it("받은 요청이 있으면 배지에 totalCount를 표시한다", async () => {
    mockFetchFriendRequests.mockResolvedValue({
      items: [REQUEST_ITEM],
      nextCursor: null,
      totalCount: 3,
    });
    renderSection();

    expect(await screen.findByText("3")).toBeInTheDocument();
  });

  it("헤더 클릭으로 목록을 펼치고 접을 수 있다", async () => {
    mockFetchFriendRequests.mockResolvedValue({
      items: [REQUEST_ITEM],
      nextCursor: null,
      totalCount: 1,
    });
    renderSection();

    await waitFor(() => expect(mockFetchFriendRequests).toHaveBeenCalled());
    expect(screen.queryByText("앨리스")).not.toBeInTheDocument();

    openDropdown();
    expect(await screen.findByText("앨리스")).toBeInTheDocument();

    openDropdown();
    expect(screen.queryByText("앨리스")).not.toBeInTheDocument();
  });

  it("받은 요청 목록을 이름/username과 함께 표시한다", async () => {
    mockFetchFriendRequests.mockResolvedValue({
      items: [REQUEST_ITEM],
      nextCursor: null,
      totalCount: 1,
    });
    renderSection();
    openDropdown();

    expect(await screen.findByText("앨리스")).toBeInTheDocument();
    expect(screen.getByText("@alice")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "수락" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "거절" })).toBeInTheDocument();
  });

  it("이름이 없으면 username을 표시한다", async () => {
    mockFetchFriendRequests.mockResolvedValue({
      items: [{ ...REQUEST_ITEM, name: null }],
      nextCursor: null,
      totalCount: 1,
    });
    renderSection();
    openDropdown();

    expect(await screen.findByText("alice")).toBeInTheDocument();
    expect(screen.getByText("@alice")).toBeInTheDocument();
  });

  it("수락 클릭 시 acceptFriendRequest가 호출되고 목록·배지에서 제거되며 친구 목록을 무효화한다", async () => {
    mockFetchFriendRequests.mockResolvedValue({
      items: [REQUEST_ITEM],
      nextCursor: null,
      totalCount: 1,
    });
    mockAcceptFriendRequest.mockResolvedValue(undefined);
    renderSection();
    openDropdown();

    const acceptButton = await screen.findByRole("button", { name: "수락" });
    fireEvent.click(acceptButton);

    await waitFor(() => {
      expect(mockAcceptFriendRequest).toHaveBeenCalledWith("fs-1", expect.anything());
    });

    await waitFor(() => {
      expect(screen.queryByText("앨리스")).not.toBeInTheDocument();
      expect(screen.queryByText("1")).not.toBeInTheDocument();
    });
  });

  it("거절 클릭 시 declineFriendRequest가 호출되고 목록에서 제거된다", async () => {
    mockFetchFriendRequests.mockResolvedValue({
      items: [REQUEST_ITEM],
      nextCursor: null,
      totalCount: 1,
    });
    mockDeclineFriendRequest.mockResolvedValue(undefined);
    renderSection();
    openDropdown();

    const declineButton = await screen.findByRole("button", { name: "거절" });
    fireEvent.click(declineButton);

    await waitFor(() => {
      expect(mockDeclineFriendRequest).toHaveBeenCalledWith("fs-1", expect.anything());
    });

    await waitFor(() => {
      expect(screen.queryByText("앨리스")).not.toBeInTheDocument();
    });
  });

  it("받은 요청을 1건 처리하면 배지 숫자가 1 줄어든다", async () => {
    const otherItem = { ...REQUEST_ITEM, friendshipId: "fs-2", id: "user-2", username: "bob", name: "보브" };
    mockFetchFriendRequests.mockResolvedValue({
      items: [REQUEST_ITEM, otherItem],
      nextCursor: null,
      totalCount: 2,
    });
    mockAcceptFriendRequest.mockResolvedValue(undefined);
    renderSection();
    openDropdown();

    expect(await screen.findByText("2")).toBeInTheDocument();

    const acceptButtons = await screen.findAllByRole("button", { name: "수락" });
    fireEvent.click(acceptButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.queryByText("2")).not.toBeInTheDocument();
    });
  });

  it("수락 처리 중에는 해당 항목의 수락/거절 버튼이 비활성화된다", async () => {
    mockFetchFriendRequests.mockResolvedValue({
      items: [REQUEST_ITEM],
      nextCursor: null,
      totalCount: 1,
    });
    mockAcceptFriendRequest.mockImplementation(() => new Promise(() => {}));
    renderSection();
    openDropdown();

    const acceptButton = await screen.findByRole("button", { name: "수락" });
    fireEvent.click(acceptButton);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "수락" })).toBeDisabled();
    });
    expect(screen.getByRole("button", { name: "거절" })).toBeDisabled();
  });

  it("acceptFriendRequest 실패 시 알림을 표시하고 목록을 유지한다", async () => {
    mockFetchFriendRequests.mockResolvedValue({
      items: [REQUEST_ITEM],
      nextCursor: null,
      totalCount: 1,
    });
    mockAcceptFriendRequest.mockRejectedValue(new Error("요청을 찾을 수 없습니다."));
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    renderSection();
    openDropdown();

    const acceptButton = await screen.findByRole("button", { name: "수락" });
    fireEvent.click(acceptButton);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("요청을 찾을 수 없습니다.");
    });
    expect(screen.getByText("앨리스")).toBeInTheDocument();

    alertSpy.mockRestore();
  });

  describe("무한 스크롤", () => {
    it("nextCursor가 있을 때 sentinel이 보이면 다음 페이지를 불러와 목록에 추가한다", async () => {
      const page2Item = { ...REQUEST_ITEM, friendshipId: "fs-2", id: "user-2", username: "bob", name: "보브" };
      mockFetchFriendRequests
        .mockResolvedValueOnce({ items: [REQUEST_ITEM], nextCursor: "fs-1", totalCount: 11 })
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

      expect(mockFetchFriendRequests).toHaveBeenCalledTimes(2);
      expect(mockFetchFriendRequests).toHaveBeenLastCalledWith("fs-1");
    });

    it("isIntersecting: false일 때 추가 fetch 없음", async () => {
      mockFetchFriendRequests.mockResolvedValue({
        items: [REQUEST_ITEM],
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

      expect(mockFetchFriendRequests).toHaveBeenCalledTimes(1);
    });
  });
});
