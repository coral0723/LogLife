import type { ComponentProps } from "react";

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ProfileBadge } from "../ProfileBadge";
import { fetchCurrentUser } from "@/api/user";
import { AVATAR_PATHS } from "@/lib/avatar";

vi.mock("@/api/user", () => ({
  fetchCurrentUser: vi.fn(),
  userQueryKeys: {
    me: () => ["user", "me"],
  },
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: ComponentProps<"a">) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const mockFetchCurrentUser = vi.mocked(fetchCurrentUser);

function renderBadge() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(<ProfileBadge />, { wrapper: Wrapper });
}

describe("ProfileBadge", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("로딩 중에는 스켈레톤을 표시한다", () => {
    mockFetchCurrentUser.mockImplementation(() => new Promise(() => {}));
    renderBadge();

    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("정상 데이터 로드 후 아바타와 닉네임을 표시한다", async () => {
    mockFetchCurrentUser.mockResolvedValue({
      image: "https://example.com/photo.jpg",
      name: "홍길동",
      username: "honggildong",
    });
    const { container } = renderBadge();

    expect(await screen.findByText("홍길동")).toBeInTheDocument();
    expect(container.querySelector("img")!.src).toBe("https://example.com/photo.jpg");
  });

  it("name이 null이면 username을 닉네임으로 표시한다", async () => {
    mockFetchCurrentUser.mockResolvedValue({
      image: "https://example.com/photo.jpg",
      name: null,
      username: "honggildong",
    });
    renderBadge();

    expect(await screen.findByText("honggildong")).toBeInTheDocument();
  });

  it("image가 null이면 AVATAR_PATHS[0]을 아바타로 사용한다", async () => {
    mockFetchCurrentUser.mockResolvedValue({
      image: null,
      name: "홍길동",
      username: "honggildong",
    });
    const { container } = renderBadge();

    await screen.findByText("홍길동");
    expect(container.querySelector("img")!.src).toContain(AVATAR_PATHS[0]);
  });

  it("내 정보 조회 실패 시 닉네임을 '-'로 표시한다", async () => {
    mockFetchCurrentUser.mockRejectedValue(new Error("실패"));
    renderBadge();

    expect(await screen.findByText("-")).toBeInTheDocument();
  });

  it("/profile로 이동하는 링크를 렌더링한다", async () => {
    mockFetchCurrentUser.mockResolvedValue({
      image: "https://example.com/photo.jpg",
      name: "홍길동",
      username: "honggildong",
    });
    renderBadge();

    expect(await screen.findByRole("link")).toHaveAttribute("href", "/profile");
  });
});
