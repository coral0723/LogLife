import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AchievementStatsWidget } from "../AchievementStatsWidget";
import { fetchAchievementStats } from "@/api/dashboard";

vi.mock("@/api/dashboard", () => ({
  fetchAchievementStats: vi.fn(),
  dashboardQueryKeys: {
    achievementStats: () => ["dashboard", "achievement-stats"],
  },
}));

vi.mock("@phosphor-icons/react", () => ({
  Trophy: () => <span data-testid="icon-trophy" />,
}));

const mockFetchAchievementStats = vi.mocked(fetchAchievementStats);

function renderWidget(isOpen: boolean) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(<AchievementStatsWidget isOpen={isOpen} />, { wrapper: Wrapper });
}

describe("AchievementStatsWidget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("로딩 중에는 스켈레톤을 표시한다", () => {
    mockFetchAchievementStats.mockImplementation(() => new Promise(() => {}));
    const { container } = renderWidget(true);

    expect(container.querySelectorAll(".animate-pulse")).toHaveLength(4);
  });

  it("fetchAchievementStats 실패 시 에러 메시지를 표시한다", async () => {
    mockFetchAchievementStats.mockRejectedValue(new Error("실패"));
    renderWidget(true);

    expect(await screen.findByText("통계를 불러오지 못했어요")).toBeInTheDocument();
  });

  it("avgDays와 longestItem이 null이면 안내 문구와 아이콘을 표시한다", async () => {
    mockFetchAchievementStats.mockResolvedValue({
      achievementRate: 0,
      avgDays: null,
      longestItem: null,
    });
    renderWidget(true);

    expect(await screen.findByText("아직 달성한 항목이 없어요")).toBeInTheDocument();
    expect(screen.getByText("버킷리스트를 달성해보세요")).toBeInTheDocument();
    expect(screen.getByTestId("icon-trophy")).toBeInTheDocument();
  });

  it("정상 데이터 로드 후 평균 달성 소요 기간과 가장 오래 미룬 항목을 표시한다", async () => {
    mockFetchAchievementStats.mockResolvedValue({
      achievementRate: 50,
      avgDays: 12,
      longestItem: { title: "유럽 여행", displayName: "사용자", days: 30 },
    });
    renderWidget(true);

    expect(await screen.findByText("평균 달성 소요 기간")).toBeInTheDocument();
    expect(screen.getByText("12일")).toBeInTheDocument();
    expect(screen.getByText("가장 오래 미룬 항목")).toBeInTheDocument();
    expect(screen.getByText("유럽 여행 · 30일")).toBeInTheDocument();
  });

  it("isOpen=false면 쿼리가 비활성화되어 fetch가 호출되지 않는다", () => {
    mockFetchAchievementStats.mockResolvedValue({
      achievementRate: 0,
      avgDays: null,
      longestItem: null,
    });
    renderWidget(false);

    expect(mockFetchAchievementStats).not.toHaveBeenCalled();
  });

  it("isOpen이 false에서 true로 바뀌면 fetch가 호출된다", () => {
    mockFetchAchievementStats.mockResolvedValue({
      achievementRate: 0,
      avgDays: null,
      longestItem: null,
    });
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { rerender } = render(<AchievementStatsWidget isOpen={false} />, { wrapper: Wrapper });

    expect(mockFetchAchievementStats).not.toHaveBeenCalled();

    rerender(<AchievementStatsWidget isOpen={true} />);

    expect(mockFetchAchievementStats).toHaveBeenCalled();
  });
});
