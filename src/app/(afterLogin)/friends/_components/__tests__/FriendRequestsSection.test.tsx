import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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

describe("FriendRequestsSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("받은 요청이 없으면 아무것도 렌더링하지 않는다", async () => {
    mockFetchFriendRequests.mockResolvedValue([]);
    const { container } = renderSection();

    await waitFor(() => {
      expect(mockFetchFriendRequests).toHaveBeenCalled();
    });

    expect(container).toBeEmptyDOMElement();
  });

  it("받은 요청 목록을 이름/username과 함께 표시한다", async () => {
    mockFetchFriendRequests.mockResolvedValue([REQUEST_ITEM]);
    renderSection();

    expect(await screen.findByText("앨리스")).toBeInTheDocument();
    expect(screen.getByText("@alice")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "수락" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "거절" })).toBeInTheDocument();
  });

  it("이름이 없으면 username을 표시한다", async () => {
    mockFetchFriendRequests.mockResolvedValue([{ ...REQUEST_ITEM, name: null }]);
    renderSection();

    expect(await screen.findByText("alice")).toBeInTheDocument();
    expect(screen.getByText("@alice")).toBeInTheDocument();
  });

  it("수락 클릭 시 acceptFriendRequest가 호출되고 목록에서 제거되며 친구 목록을 무효화한다", async () => {
    mockFetchFriendRequests.mockResolvedValue([REQUEST_ITEM]);
    mockAcceptFriendRequest.mockResolvedValue(undefined);
    renderSection();

    const acceptButton = await screen.findByRole("button", { name: "수락" });
    fireEvent.click(acceptButton);

    await waitFor(() => {
      expect(mockAcceptFriendRequest).toHaveBeenCalledWith("fs-1", expect.anything());
    });

    await waitFor(() => {
      expect(screen.queryByText("앨리스")).not.toBeInTheDocument();
    });
  });

  it("거절 클릭 시 declineFriendRequest가 호출되고 목록에서 제거된다", async () => {
    mockFetchFriendRequests.mockResolvedValue([REQUEST_ITEM]);
    mockDeclineFriendRequest.mockResolvedValue(undefined);
    renderSection();

    const declineButton = await screen.findByRole("button", { name: "거절" });
    fireEvent.click(declineButton);

    await waitFor(() => {
      expect(mockDeclineFriendRequest).toHaveBeenCalledWith("fs-1", expect.anything());
    });

    await waitFor(() => {
      expect(screen.queryByText("앨리스")).not.toBeInTheDocument();
    });
  });

  it("수락 처리 중에는 해당 항목의 수락/거절 버튼이 비활성화된다", async () => {
    mockFetchFriendRequests.mockResolvedValue([REQUEST_ITEM]);
    mockAcceptFriendRequest.mockImplementation(() => new Promise(() => {}));
    renderSection();

    const acceptButton = await screen.findByRole("button", { name: "수락" });
    fireEvent.click(acceptButton);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "수락" })).toBeDisabled();
    });
    expect(screen.getByRole("button", { name: "거절" })).toBeDisabled();
  });

  it("acceptFriendRequest 실패 시 알림을 표시하고 목록을 유지한다", async () => {
    mockFetchFriendRequests.mockResolvedValue([REQUEST_ITEM]);
    mockAcceptFriendRequest.mockRejectedValue(new Error("요청을 찾을 수 없습니다."));
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    renderSection();

    const acceptButton = await screen.findByRole("button", { name: "수락" });
    fireEvent.click(acceptButton);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("요청을 찾을 수 없습니다.");
    });
    expect(screen.getByText("앨리스")).toBeInTheDocument();

    alertSpy.mockRestore();
  });
});
