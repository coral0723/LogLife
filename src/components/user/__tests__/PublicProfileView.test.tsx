import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { PublicProfileView } from "../PublicProfileView";
import { fetchPublicUser } from "@/api/user";
import { AVATAR_PATHS } from "@/lib/avatar";

vi.mock("@/api/user", () => ({
  fetchPublicUser: vi.fn(),
  userQueryKeys: {
    profile: (username: string) => ["user", "profile", username],
  },
}));

vi.mock("@/components/ui/LoadingSpinner", () => ({
  default: () => <div data-testid="loading-spinner" />,
}));

vi.mock("@/components/ui/ImageWithFallback", () => ({
  ImageWithFallback: (props: { src: string; alt: string }) => (
    <img src={props.src} alt={props.alt} />
  ),
}));

vi.mock("@/components/dashboard/BucketCountWidget", () => ({
  BucketCountWidget: ({ username }: { username: string }) => (
    <div data-testid="widget-bucket-count" data-username={username} />
  ),
}));

vi.mock("@/components/dashboard/UpcomingDeadlinesWidget", () => ({
  UpcomingDeadlinesWidget: ({ username }: { username: string }) => (
    <div data-testid="widget-upcoming-deadlines" data-username={username} />
  ),
}));

vi.mock("@/components/dashboard/DifficultyExcitementMatrixWidget", () => ({
  DifficultyExcitementMatrixWidget: ({ username }: { username: string }) => (
    <div data-testid="widget-difficulty-excitement" data-username={username} />
  ),
}));

vi.mock("@/components/dashboard/AchievementStatsWidget", () => ({
  AchievementStatsWidget: ({ username }: { username: string }) => (
    <div data-testid="widget-achievement-stats" data-username={username} />
  ),
}));

const mockFetchPublicUser = vi.mocked(fetchPublicUser);

function renderView(username = "alice") {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <PublicProfileView username={username} />
    </QueryClientProvider>,
  );
}

describe("PublicProfileView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("로딩 중에는 스피너를 표시한다", () => {
    mockFetchPublicUser.mockImplementation(() => new Promise(() => {}));
    renderView();
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  it("에러 시 오류 메시지를 표시한다", async () => {
    mockFetchPublicUser.mockRejectedValue(new Error("실패"));
    renderView();
    expect(await screen.findByText("사용자 정보를 불러올 수 없습니다.")).toBeInTheDocument();
  });

  it("정상 로드 후 닉네임과 4개의 위젯을 표시한다", async () => {
    mockFetchPublicUser.mockResolvedValue({
      id: "user-1",
      username: "alice",
      name: "앨리스",
      image: "https://example.com/photo.jpg",
    });
    renderView("alice");

    expect(await screen.findByText("앨리스")).toBeInTheDocument();
    expect(screen.getByTestId("widget-bucket-count")).toBeInTheDocument();
    expect(screen.getByTestId("widget-upcoming-deadlines")).toBeInTheDocument();
    expect(screen.getByTestId("widget-difficulty-excitement")).toBeInTheDocument();
    expect(screen.getByTestId("widget-achievement-stats")).toBeInTheDocument();
  });

  it("위젯에 올바른 username이 전달된다", async () => {
    mockFetchPublicUser.mockResolvedValue({
      id: "user-1",
      username: "alice",
      name: "앨리스",
      image: null,
    });
    renderView("alice");

    await screen.findByText("앨리스");
    expect(screen.getByTestId("widget-bucket-count")).toHaveAttribute("data-username", "alice");
  });

  it("name이 null이면 username을 닉네임으로 표시한다", async () => {
    mockFetchPublicUser.mockResolvedValue({
      id: "user-1",
      username: "alice",
      name: null,
      image: null,
    });
    renderView();
    expect(await screen.findByText("alice")).toBeInTheDocument();
  });

  it("image가 null이면 AVATAR_PATHS[0]을 아바타로 사용한다", async () => {
    mockFetchPublicUser.mockResolvedValue({
      id: "user-1",
      username: "alice",
      name: "앨리스",
      image: null,
    });
    const { container } = renderView();

    await screen.findByText("앨리스");
    expect(container.querySelector("img")!.src).toContain(AVATAR_PATHS[0]);
  });
});
