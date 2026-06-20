import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { UserSearchResultItem } from "../UserSearchResultItem";
import { acceptFriendRequest, sendFriendRequest } from "@/actions/friend/actions";
import type { UserSearchResult } from "@/api/friends";

vi.mock("@/actions/friend/actions", () => ({
  sendFriendRequest: vi.fn(),
  acceptFriendRequest: vi.fn(),
}));

const mockSendFriendRequest = vi.mocked(sendFriendRequest);
const mockAcceptFriendRequest = vi.mocked(acceptFriendRequest);

const BASE_USER: UserSearchResult = {
  id: "user-1",
  username: "alice",
  name: "앨리스",
  image: null,
  relation: "none",
};

function renderItem(user: UserSearchResult, onSendSuccess = vi.fn()) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  render(
    <ul>
      <UserSearchResultItem user={user} searchQuery="ali" onSendSuccess={onSendSuccess} />
    </ul>,
    { wrapper: Wrapper },
  );
  return { invalidateSpy, onSendSuccess };
}

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe("UserSearchResultItem", () => {
  it("이름/username을 표시한다", () => {
    renderItem(BASE_USER);
    expect(screen.getByText("앨리스")).toBeInTheDocument();
    expect(screen.getByText("@alice")).toBeInTheDocument();
  });

  it("이름이 없으면 username을 표시한다", () => {
    renderItem({ ...BASE_USER, name: null });
    expect(screen.getByText("alice")).toBeInTheDocument();
  });

  describe("relation: none", () => {
    it("친구 추가 버튼 클릭 시 sendFriendRequest를 호출하고 결과를 알린다", async () => {
      mockSendFriendRequest.mockResolvedValue({ status: "PENDING" });
      const { invalidateSpy, onSendSuccess } = renderItem(BASE_USER);

      fireEvent.click(screen.getByRole("button", { name: "친구 추가" }));

      await waitFor(() => {
        expect(mockSendFriendRequest).toHaveBeenCalledWith("user-1", expect.anything());
      });
      await waitFor(() => {
        expect(onSendSuccess).toHaveBeenCalledWith("PENDING");
      });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["friends", "search", "ali"] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["friends", "list"] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["friends", "requests"] });
    });

    it("상호 요청으로 ACCEPTED가 반환되면 onSendSuccess에 ACCEPTED를 전달한다", async () => {
      mockSendFriendRequest.mockResolvedValue({ status: "ACCEPTED" });
      const { onSendSuccess } = renderItem(BASE_USER);

      fireEvent.click(screen.getByRole("button", { name: "친구 추가" }));

      await waitFor(() => {
        expect(onSendSuccess).toHaveBeenCalledWith("ACCEPTED");
      });
    });

    it("처리 중에는 버튼이 비활성화된다", async () => {
      mockSendFriendRequest.mockImplementation(() => new Promise(() => {}));
      renderItem(BASE_USER);

      const button = screen.getByRole("button", { name: "친구 추가" });
      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toBeDisabled();
      });
    });

    it("실패 시 알림을 표시한다", async () => {
      mockSendFriendRequest.mockRejectedValue(new Error("이미 친구입니다."));
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
      renderItem(BASE_USER);

      fireEvent.click(screen.getByRole("button", { name: "친구 추가" }));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith("이미 친구입니다.");
      });
    });
  });

  describe("relation: pending_sent", () => {
    it("비활성 '요청됨' 표시만 보여주고 버튼은 없다", () => {
      renderItem({ ...BASE_USER, relation: "pending_sent", friendshipId: "fs-1" });

      expect(screen.getByText("요청됨")).toBeInTheDocument();
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });

  describe("relation: pending_received", () => {
    it("수락 버튼 클릭 시 acceptFriendRequest를 호출하고 ACCEPTED를 알린다", async () => {
      mockAcceptFriendRequest.mockResolvedValue(undefined);
      const { invalidateSpy, onSendSuccess } = renderItem({
        ...BASE_USER,
        relation: "pending_received",
        friendshipId: "fs-1",
      });

      fireEvent.click(screen.getByRole("button", { name: "수락" }));

      await waitFor(() => {
        expect(mockAcceptFriendRequest).toHaveBeenCalledWith("fs-1", expect.anything());
      });
      await waitFor(() => {
        expect(onSendSuccess).toHaveBeenCalledWith("ACCEPTED");
      });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["friends", "requests"] });
    });
  });

  describe("relation: friends", () => {
    it("'친구' 라벨만 표시하고 버튼은 없다", () => {
      renderItem({ ...BASE_USER, relation: "friends", friendshipId: "fs-1" });

      expect(screen.getByText("친구")).toBeInTheDocument();
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });
});
