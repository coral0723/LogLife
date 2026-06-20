import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { UserSearchSection } from "../UserSearchSection";
import { searchUsers } from "@/api/friends";
import { acceptFriendRequest, sendFriendRequest } from "@/actions/friend/actions";

vi.mock("@/api/friends", () => ({
  searchUsers: vi.fn(),
  friendQueryKeys: {
    search: (q: string) => ["friends", "search", q],
    list: () => ["friends", "list"],
    requests: () => ["friends", "requests"],
  },
}));

vi.mock("@/actions/friend/actions", () => ({
  sendFriendRequest: vi.fn(),
  acceptFriendRequest: vi.fn(),
}));

const mockSearchUsers = vi.mocked(searchUsers);
const mockSendFriendRequest = vi.mocked(sendFriendRequest);
const mockAcceptFriendRequest = vi.mocked(acceptFriendRequest);

const SEARCH_PLACEHOLDER = "이름 또는 아이디로 검색";

const USER_NONE = {
  id: "user-1",
  username: "alice",
  name: "앨리스",
  image: null,
  relation: "none" as const,
};

function renderSection() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(<UserSearchSection />, { wrapper: Wrapper });
}

function typeQuery(value: string) {
  fireEvent.change(screen.getByPlaceholderText(SEARCH_PLACEHOLDER), {
    target: { value },
  });
}

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe("UserSearchSection", () => {
  it("검색어가 없으면 결과 영역을 표시하지 않는다", () => {
    renderSection();
    expect(screen.getByText("친구 찾기")).toBeInTheDocument();
    expect(mockSearchUsers).not.toHaveBeenCalled();
  });

  it("디바운스 후 검색어로 searchUsers를 호출한다", async () => {
    mockSearchUsers.mockResolvedValue([]);
    renderSection();

    typeQuery("ali");

    await waitFor(() => {
      expect(mockSearchUsers).toHaveBeenCalledWith("ali");
    });
  });

  it("검색 결과가 없으면 안내 문구를 표시한다", async () => {
    mockSearchUsers.mockResolvedValue([]);
    renderSection();

    typeQuery("nobody");

    expect(await screen.findByText("검색 결과가 없습니다")).toBeInTheDocument();
  });

  it("검색 결과를 이름/username과 함께 표시한다", async () => {
    mockSearchUsers.mockResolvedValue([USER_NONE]);
    renderSection();

    typeQuery("ali");

    expect(await screen.findByText("앨리스")).toBeInTheDocument();
    expect(screen.getByText("@alice")).toBeInTheDocument();
  });

  describe("관계별 액션", () => {
    it("relation: none → 친구 추가 버튼을 표시한다", async () => {
      mockSearchUsers.mockResolvedValue([USER_NONE]);
      renderSection();

      typeQuery("ali");

      expect(await screen.findByRole("button", { name: "친구 추가" })).toBeInTheDocument();
    });

    it("relation: pending_sent → 비활성 '요청됨' 표시를 보여준다", async () => {
      mockSearchUsers.mockResolvedValue([
        { ...USER_NONE, relation: "pending_sent" as const, friendshipId: "fs-1" },
      ]);
      renderSection();

      typeQuery("ali");

      expect(await screen.findByText("요청됨")).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "친구 추가" })).not.toBeInTheDocument();
    });

    it("relation: pending_received → 수락 버튼을 표시한다", async () => {
      mockSearchUsers.mockResolvedValue([
        { ...USER_NONE, relation: "pending_received" as const, friendshipId: "fs-1" },
      ]);
      renderSection();

      typeQuery("ali");

      expect(await screen.findByRole("button", { name: "수락" })).toBeInTheDocument();
    });

    it("relation: friends → '친구' 라벨을 표시한다", async () => {
      mockSearchUsers.mockResolvedValue([
        { ...USER_NONE, relation: "friends" as const, friendshipId: "fs-1" },
      ]);
      renderSection();

      typeQuery("ali");

      expect(await screen.findByText("친구")).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "친구 추가" })).not.toBeInTheDocument();
    });
  });

  describe("친구 추가", () => {
    it("PENDING 응답 시 '요청을 보냈습니다' 토스트를 표시하고 일정 시간 후 사라진다", async () => {
      mockSearchUsers.mockResolvedValue([USER_NONE]);
      mockSendFriendRequest.mockResolvedValue({ status: "PENDING" });
      renderSection();

      typeQuery("ali");
      fireEvent.click(await screen.findByRole("button", { name: "친구 추가" }));

      expect(await screen.findByText("요청을 보냈습니다")).toBeInTheDocument();

      await waitFor(
        () => {
          expect(screen.queryByText("요청을 보냈습니다")).not.toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    }, 10000);

    it("ACCEPTED 응답 시 '친구가 되었습니다' 토스트를 표시한다", async () => {
      mockSearchUsers.mockResolvedValue([USER_NONE]);
      mockSendFriendRequest.mockResolvedValue({ status: "ACCEPTED" });
      renderSection();

      typeQuery("ali");
      fireEvent.click(await screen.findByRole("button", { name: "친구 추가" }));

      expect(await screen.findByText("친구가 되었습니다")).toBeInTheDocument();
    });

    it("실패 시 알림을 표시한다", async () => {
      mockSearchUsers.mockResolvedValue([USER_NONE]);
      mockSendFriendRequest.mockRejectedValue(new Error("이미 요청을 보냈습니다."));
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
      renderSection();

      typeQuery("ali");
      fireEvent.click(await screen.findByRole("button", { name: "친구 추가" }));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith("이미 요청을 보냈습니다.");
      });
    });
  });

  describe("받은 요청 수락", () => {
    it("수락 클릭 시 acceptFriendRequest를 호출하고 '친구가 되었습니다' 토스트를 표시한다", async () => {
      mockSearchUsers.mockResolvedValue([
        { ...USER_NONE, relation: "pending_received" as const, friendshipId: "fs-1" },
      ]);
      mockAcceptFriendRequest.mockResolvedValue(undefined);
      renderSection();

      typeQuery("ali");
      fireEvent.click(await screen.findByRole("button", { name: "수락" }));

      await waitFor(() => {
        expect(mockAcceptFriendRequest).toHaveBeenCalledWith("fs-1", expect.anything());
      });
      expect(await screen.findByText("친구가 되었습니다")).toBeInTheDocument();
    });
  });
});
