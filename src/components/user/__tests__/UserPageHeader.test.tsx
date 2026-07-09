import type { ComponentProps } from "react";

import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { UserPageHeader } from "../UserPageHeader";
import { sendFriendRequest } from "@/actions/friend/actions";

vi.mock("@phosphor-icons/react", () => ({
  ArrowLeft: () => <svg data-testid="arrow-left" />,
  UserPlus: () => <svg data-testid="user-plus" />,
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: ComponentProps<"a">) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/ui/ImageWithFallback", () => ({
  // eslint-disable-next-line @next/next/no-img-element -- ImageWithFallback을 목킹하는 용도
  ImageWithFallback: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

vi.mock("@/actions/friend/actions", () => ({
  sendFriendRequest: vi.fn(),
}));

const mockSendFriendRequest = vi.mocked(sendFriendRequest);

type FriendRelation = "none" | "pending_sent" | "pending_received" | "friends";

const BASE_TARGET = {
  id: "user-1",
  username: "alice",
  name: "앨리스",
  image: null,
};

type RenderOptions = {
  username?: string;
  targetUser?: typeof BASE_TARGET;
  isLoggedIn?: boolean;
  relation?: FriendRelation;
  isSelf?: boolean;
};

function renderHeader(options: RenderOptions = {}) {
  const {
    username = "alice",
    targetUser = BASE_TARGET,
    isLoggedIn = true,
    relation = "none",
    isSelf = false,
  } = options;

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <UserPageHeader
        username={username}
        targetUser={targetUser}
        isLoggedIn={isLoggedIn}
        relation={relation}
        isSelf={isSelf}
      />
    </QueryClientProvider>,
  );
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("UserPageHeader", () => {
  describe("뒤로가기 링크", () => {
    it("로그인 상태에서 /main으로 이동한다", () => {
      renderHeader({ isLoggedIn: true });
      expect(screen.getByRole("link", { name: "뒤로가기" })).toHaveAttribute("href", "/main");
    });

    it("비로그인 상태에서 /으로 이동한다", () => {
      renderHeader({ isLoggedIn: false });
      expect(screen.getByRole("link", { name: "뒤로가기" })).toHaveAttribute("href", "/");
    });
  });

  describe("프로필 뱃지", () => {
    it("/u/{username}/profile 링크를 렌더링한다", () => {
      renderHeader({ username: "alice" });
      const links = screen.getAllByRole("link");
      const profileLink = links.find((l) => l.getAttribute("href") === "/u/alice/profile");
      expect(profileLink).toBeInTheDocument();
    });

    it("targetUser.name을 표시한다", () => {
      renderHeader();
      expect(screen.getByText("앨리스")).toBeInTheDocument();
    });

    it("targetUser.name이 null이면 username을 표시한다", () => {
      renderHeader({ targetUser: { ...BASE_TARGET, name: null } });
      expect(screen.getByText("alice")).toBeInTheDocument();
    });
  });

  describe("친구 아이콘 표시 여부", () => {
    it("isSelf=true이면 친구 아이콘을 표시하지 않는다", () => {
      renderHeader({ isSelf: true });
      expect(screen.queryByRole("button", { name: "친구 추가" })).not.toBeInTheDocument();
      expect(screen.queryByRole("link", { name: "친구 추가" })).not.toBeInTheDocument();
    });

    it("relation=friends이면 친구 아이콘을 표시하지 않는다", () => {
      renderHeader({ relation: "friends" });
      expect(screen.queryByRole("button", { name: /친구/ })).not.toBeInTheDocument();
      expect(screen.queryByRole("link", { name: /친구/ })).not.toBeInTheDocument();
    });

    it("relation=pending_received이면 친구 아이콘을 표시하지 않는다", () => {
      renderHeader({ relation: "pending_received" });
      expect(screen.queryByRole("button", { name: /친구/ })).not.toBeInTheDocument();
      expect(screen.queryByRole("link", { name: /친구/ })).not.toBeInTheDocument();
    });

    it("relation=none, 비로그인이면 /login 링크를 표시한다", () => {
      renderHeader({ isLoggedIn: false, relation: "none" });
      expect(screen.getByRole("link", { name: "친구 추가" })).toHaveAttribute("href", "/login");
    });

    it("relation=pending_sent이면 비활성화된 요청 버튼을 표시한다", () => {
      renderHeader({ relation: "pending_sent" });
      const button = screen.getByRole("button", { name: "친구 요청 보냄" });
      expect(button).toBeDisabled();
    });
  });

  describe("친구 추가 버튼 (relation=none, isLoggedIn=true)", () => {
    it("버튼 클릭 시 sendFriendRequest를 targetUser.id로 호출한다", async () => {
      mockSendFriendRequest.mockResolvedValue({ status: "PENDING" });
      renderHeader();

      fireEvent.click(screen.getByRole("button", { name: "친구 추가" }));

      await waitFor(() => {
        expect(mockSendFriendRequest).toHaveBeenCalledWith("user-1", expect.anything());
      });
    });

    it("mutation 성공 시 alert를 표시하고 버튼이 비활성 상태로 전환된다", async () => {
      mockSendFriendRequest.mockResolvedValue({ status: "PENDING" });
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
      renderHeader();

      fireEvent.click(screen.getByRole("button", { name: "친구 추가" }));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith("친구 신청이 되었습니다.");
      });
      expect(screen.getByRole("button", { name: "친구 요청 보냄" })).toBeDisabled();
    });

    it("mutation 처리 중에는 버튼이 비활성화된다", async () => {
      mockSendFriendRequest.mockImplementation(() => new Promise(() => {}));
      renderHeader();

      const button = screen.getByRole("button", { name: "친구 추가" });
      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toBeDisabled();
      });
    });

    it("mutation 실패 시 alert로 오류 메시지를 표시한다", async () => {
      mockSendFriendRequest.mockRejectedValue(new Error("이미 친구입니다."));
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
      renderHeader();

      fireEvent.click(screen.getByRole("button", { name: "친구 추가" }));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith("이미 친구입니다.");
      });
    });
  });
});
