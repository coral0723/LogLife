import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BucketDetailView } from "../BucketDetailView";
import { toggleAchieved, updateDeadline } from "@/actions/bucketList/actions";
import type { BucketDetail } from "@/api/bucketlists";

const mockToggleAchieved = vi.mocked(toggleAchieved);
const mockUpdateDeadline = vi.mocked(updateDeadline);

vi.mock("@/api/bucketlists", () => ({
  fetchBucketDetail: vi.fn(),
  bucketQueryKeys: {
    detail: (id: string) => ["bucketlists", "detail", id],
    byCountry: (code: string) => ["bucketlists", "by-country", code],
  },
}));

vi.mock("@/api/dashboard", () => ({
  dashboardQueryKeys: {
    upcomingDeadlines: () => ["dashboard", "upcoming-deadlines"],
    difficultyExcitement: () => ["dashboard", "difficulty-excitement"],
    achievementStats: () => ["dashboard", "achievement-stats"],
  },
}));

vi.mock("@/actions/bucketList/actions", () => ({
  toggleAchieved: vi.fn(),
  updateDeadline: vi.fn(),
}));

vi.mock("@phosphor-icons/react", () => ({
  ArrowLeft: () => <span data-testid="icon-arrow-left" />,
  Camera: () => <span data-testid="icon-camera" />,
  Globe: () => <span data-testid="icon-globe" />,
  Lock: () => <span data-testid="icon-lock" />,
  MapPin: () => <span data-testid="icon-map-pin" />,
  ShareNetwork: () => <span data-testid="icon-share" />,
  Users: () => <span data-testid="icon-users" />,
}));

const baseDetail: BucketDetail = {
  id: "item-1",
  title: "도쿄 타워 방문",
  description: null,
  visibility: "PUBLIC",
  deadlineAt: null,
  achievedAt: null,
  difficulty: 3,
  excitement: 4,
  achieved: false,
  placeId: "place-123",
  displayName: "도쿄 타워, 일본",
  countryCode: "JP",
  shareToken: "token-abc",
};

// QueryClient 캐시에 detail을 미리 주입하고 렌더링 — fetch 없이 즉시 data 반환
function renderWithDetail(
  detail: BucketDetail,
  props?: { onBack?: () => void; photoSrc?: string; isOwner?: boolean },
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  queryClient.setQueryData(["bucketlists", "detail", detail.id], detail);
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return {
    ...render(<BucketDetailView bucketId={detail.id} {...props} />, {
      wrapper: Wrapper,
    }),
    queryClient,
  };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("navigator", {
    clipboard: {
      writeText: vi.fn().mockResolvedValue(undefined),
    },
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("BucketDetailView", () => {
  describe("상태 배지", () => {
    it("achieved: true → '달성' 배지 표시", () => {
      renderWithDetail({ ...baseDetail, achieved: true });
      expect(screen.getByText("달성")).toBeInTheDocument();
    });

    it("achieved: false + 과거 deadlineAt → '마감' 배지 표시", () => {
      vi.setSystemTime(new Date("2026-06-03T00:00:00Z"));
      renderWithDetail({ ...baseDetail, achieved: false, deadlineAt: "2020-01-01T00:00:00Z" });
      expect(screen.getByText("마감")).toBeInTheDocument();
    });

    it("achieved: false + 미래 deadlineAt → '진행 중' 배지 표시", () => {
      vi.setSystemTime(new Date("2026-06-03T00:00:00Z"));
      renderWithDetail({ ...baseDetail, achieved: false, deadlineAt: "2030-01-01T00:00:00Z" });
      expect(screen.getByText("진행 중")).toBeInTheDocument();
    });

    it("achieved: false + deadlineAt null → '진행 중' 배지 표시", () => {
      renderWithDetail({ ...baseDetail, achieved: false, deadlineAt: null });
      expect(screen.getByText("진행 중")).toBeInTheDocument();
    });

    it("achieved: true + 과거 deadlineAt → achieved 우선으로 '달성' 배지 표시", () => {
      vi.setSystemTime(new Date("2026-06-03T00:00:00Z"));
      renderWithDetail({ ...baseDetail, achieved: true, deadlineAt: "2020-01-01T00:00:00Z" });
      expect(screen.getByText("달성")).toBeInTheDocument();
      expect(screen.queryByText("마감")).not.toBeInTheDocument();
    });
  });

  describe("공개 범위", () => {
    it("PUBLIC → '전체 공개' 표시", () => {
      renderWithDetail({ ...baseDetail, visibility: "PUBLIC" });
      expect(screen.getByText("전체 공개")).toBeInTheDocument();
    });

    it("FRIENDS → '친구 공개' 표시", () => {
      renderWithDetail({ ...baseDetail, visibility: "FRIENDS" });
      expect(screen.getByText("친구 공개")).toBeInTheDocument();
    });

    it("PRIVATE → '비공개' 표시", () => {
      renderWithDetail({ ...baseDetail, visibility: "PRIVATE" });
      expect(screen.getByText("비공개")).toBeInTheDocument();
    });
  });

  describe("기본 콘텐츠", () => {
    it("title 표시", () => {
      renderWithDetail(baseDetail);
      expect(screen.getByText("도쿄 타워 방문")).toBeInTheDocument();
    });

    it("displayName 표시", () => {
      renderWithDetail(baseDetail);
      expect(screen.getByText("도쿄 타워, 일본")).toBeInTheDocument();
    });

    it("description 있으면 렌더링", () => {
      renderWithDetail({ ...baseDetail, description: "멋진 야경을 보고 싶다" });
      expect(screen.getByText("멋진 야경을 보고 싶다")).toBeInTheDocument();
    });

    it("description null이면 렌더링 안 함", () => {
      renderWithDetail({ ...baseDetail, description: null });
      expect(screen.queryByText("멋진 야경을 보고 싶다")).not.toBeInTheDocument();
    });
  });

  describe("DotRating", () => {
    function getFilledDots(container: HTMLElement, label: string): number {
      const labelEl = Array.from(container.querySelectorAll("p")).find(
        (p) => p.textContent === label,
      );
      const ratingDiv = labelEl?.nextElementSibling;
      return ratingDiv
        ? Array.from(ratingDiv.querySelectorAll("span")).filter((s) =>
            s.classList.contains("bg-zinc-800"),
          ).length
        : 0;
    }

    function getEmptyDots(container: HTMLElement, label: string): number {
      const labelEl = Array.from(container.querySelectorAll("p")).find(
        (p) => p.textContent === label,
      );
      const ratingDiv = labelEl?.nextElementSibling;
      return ratingDiv
        ? Array.from(ratingDiv.querySelectorAll("span")).filter((s) =>
            s.classList.contains("bg-zinc-200"),
          ).length
        : 0;
    }

    it("difficulty 3 → 채워진 점 3개, 빈 점 2개", () => {
      const { container } = renderWithDetail({ ...baseDetail, difficulty: 3 });
      expect(getFilledDots(container, "난이도")).toBe(3);
      expect(getEmptyDots(container, "난이도")).toBe(2);
    });

    it("excitement 값만큼 채워진 점 렌더링", () => {
      const { container } = renderWithDetail({ ...baseDetail, excitement: 2 });
      expect(getFilledDots(container, "설레임")).toBe(2);
      expect(getEmptyDots(container, "설레임")).toBe(3);
    });

    it("difficulty 0 → 모두 빈 점 5개", () => {
      const { container } = renderWithDetail({ ...baseDetail, difficulty: 0 });
      expect(getFilledDots(container, "난이도")).toBe(0);
      expect(getEmptyDots(container, "난이도")).toBe(5);
    });

    it("excitement 5 → 모두 채워진 점 5개", () => {
      const { container } = renderWithDetail({ ...baseDetail, excitement: 5 });
      expect(getFilledDots(container, "설레임")).toBe(5);
      expect(getEmptyDots(container, "설레임")).toBe(0);
    });
  });

  describe("날짜", () => {
    it("deadlineAt 있고 achieved false → 마감일 한국어 형식 표시", () => {
      vi.setSystemTime(new Date("2026-06-03T00:00:00Z"));
      renderWithDetail({ ...baseDetail, achieved: false, deadlineAt: "2030-12-31T00:00:00Z" });
      expect(screen.getByText(/마감일:.*2030/)).toBeInTheDocument();
    });

    it("deadlineAt 있고 achieved true → 마감일 표시 안 함", () => {
      renderWithDetail({ ...baseDetail, achieved: true, deadlineAt: "2030-12-31T00:00:00Z" });
      expect(screen.queryByText(/마감일:/)).not.toBeInTheDocument();
    });

    it("deadlineAt null → 마감일 표시 안 함", () => {
      renderWithDetail({ ...baseDetail, deadlineAt: null });
      expect(screen.queryByText(/마감일:/)).not.toBeInTheDocument();
    });

    it("achievedAt 있으면 달성일 표시", () => {
      renderWithDetail({ ...baseDetail, achieved: true, achievedAt: "2025-03-15T00:00:00Z" });
      expect(screen.getByText(/달성일:.*2025/)).toBeInTheDocument();
    });

    it("achievedAt null → 달성일 표시 안 함", () => {
      renderWithDetail({ ...baseDetail, achievedAt: null });
      expect(screen.queryByText(/달성일:/)).not.toBeInTheDocument();
    });
  });

  describe("사진", () => {
    it("photoSrc prop 있으면 해당 URL로 img 렌더링", () => {
      const { container } = renderWithDetail(baseDetail, {
        photoSrc: "https://example.com/photo.jpg",
      });
      const img = container.querySelector("img");
      expect(img).not.toBeNull();
      expect(img!.src).toBe("https://example.com/photo.jpg");
    });

    it("photoSrc 없으면 /api/places/photo?placeId=... URL로 img 렌더링", () => {
      const { container } = renderWithDetail(baseDetail);
      const img = container.querySelector("img");
      expect(img).not.toBeNull();
      expect(img!.src).toContain("/api/places/photo?placeId=place-123");
    });

    it("img 로드 실패 → Camera 아이콘 폴백 표시", () => {
      const { container } = renderWithDetail(baseDetail);
      const img = container.querySelector("img");
      expect(img).not.toBeNull();

      fireEvent.error(img!);

      expect(container.querySelector("img")).toBeNull();
      expect(screen.getByTestId("icon-camera")).toBeInTheDocument();
    });

    it("img 로드 성공 → Camera 아이콘 없음", () => {
      renderWithDetail(baseDetail);
      expect(screen.queryByTestId("icon-camera")).not.toBeInTheDocument();
    });
  });

  describe("뒤로가기 버튼", () => {
    it("onBack 있으면 뒤로가기 버튼 렌더링", () => {
      renderWithDetail(baseDetail, { onBack: vi.fn() });
      expect(
        screen.getByRole("button", { name: "목록으로 돌아가기" }),
      ).toBeInTheDocument();
    });

    it("onBack 없으면 뒤로가기 버튼 없음", () => {
      renderWithDetail(baseDetail);
      expect(
        screen.queryByRole("button", { name: "목록으로 돌아가기" }),
      ).not.toBeInTheDocument();
    });

    it("뒤로가기 버튼 클릭 → onBack 호출", () => {
      const onBack = vi.fn();
      renderWithDetail(baseDetail, { onBack });
      fireEvent.click(screen.getByRole("button", { name: "목록으로 돌아가기" }));
      expect(onBack).toHaveBeenCalledTimes(1);
    });
  });

  describe("공유 버튼", () => {
    it("PUBLIC → 공유하기 버튼 렌더링", () => {
      renderWithDetail(baseDetail);
      expect(screen.getByRole("button", { name: "공유하기" })).toBeInTheDocument();
    });

    it("PRIVATE → 공유하기 버튼 없음", () => {
      renderWithDetail({ ...baseDetail, visibility: "PRIVATE" });
      expect(screen.queryByRole("button", { name: "공유하기" })).not.toBeInTheDocument();
    });

    it("FRIENDS → 공유하기 버튼 없음", () => {
      renderWithDetail({ ...baseDetail, visibility: "FRIENDS" });
      expect(screen.queryByRole("button", { name: "공유하기" })).not.toBeInTheDocument();
    });

    it("클릭 시 clipboard.writeText에 올바른 URL(/b/{shareToken}) 전달", async () => {
      renderWithDetail({ ...baseDetail, shareToken: "token-abc" });
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "공유하기" }));
      });
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        "http://localhost:3000/b/token-abc",
      );
    });

    it("클릭 직후 '링크 복사됨' 텍스트 표시", async () => {
      renderWithDetail(baseDetail);
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "공유하기" }));
      });
      expect(screen.getByText("링크 복사됨")).toBeInTheDocument();
    });

    it("2초 후 '링크 복사됨' 사라짐", async () => {
      renderWithDetail(baseDetail);
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "공유하기" }));
      });
      expect(screen.getByText("링크 복사됨")).toBeInTheDocument();

      await act(async () => {
        vi.advanceTimersByTime(2000);
      });
      expect(screen.queryByText("링크 복사됨")).not.toBeInTheDocument();
    });
  });

  describe("본인 소유 액션 (isOwner)", () => {
    beforeEach(() => {
      vi.setSystemTime(new Date("2026-06-03T00:00:00Z"));
    });

    it("isOwner 기본값(false) → 액션 버튼 없음", () => {
      renderWithDetail({ ...baseDetail, achieved: false, deadlineAt: null });
      expect(
        screen.queryByRole("button", { name: "달성으로 표시" }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "달성 취소" }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "마감일 다시 설정" }),
      ).not.toBeInTheDocument();
    });

    it("isOwner=true + pending → '달성으로 표시' 버튼 표시", () => {
      renderWithDetail(
        { ...baseDetail, achieved: false, deadlineAt: null },
        { isOwner: true },
      );
      expect(
        screen.getByRole("button", { name: "달성으로 표시" }),
      ).toBeInTheDocument();
    });

    it("isOwner=true + achieved → '달성 취소' 버튼 표시", () => {
      renderWithDetail({ ...baseDetail, achieved: true }, { isOwner: true });
      expect(
        screen.getByRole("button", { name: "달성 취소" }),
      ).toBeInTheDocument();
    });

    it("isOwner=true + expired → '마감일 다시 설정' 버튼 표시", () => {
      renderWithDetail(
        { ...baseDetail, achieved: false, deadlineAt: "2020-01-01T00:00:00Z" },
        { isOwner: true },
      );
      expect(
        screen.getByRole("button", { name: "마감일 다시 설정" }),
      ).toBeInTheDocument();
    });

    it("'달성으로 표시' 클릭 → toggleAchieved 호출 + '되돌리기' 토스트 표시", async () => {
      mockToggleAchieved.mockResolvedValue({ achieved: true });
      renderWithDetail(
        { ...baseDetail, achieved: false, deadlineAt: null },
        { isOwner: true },
      );

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "달성으로 표시" }));
      });

      expect(mockToggleAchieved).toHaveBeenCalledWith("item-1");
      expect(screen.getByText("달성으로 표시했어요.")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "되돌리기" })).toBeInTheDocument();
    });

    it("'달성으로 표시' 클릭 → 대시보드 위젯 쿼리(마감 임박/난이도·설렘/달성 통계) invalidate", async () => {
      mockToggleAchieved.mockResolvedValue({ achieved: true });
      const { queryClient } = renderWithDetail(
        { ...baseDetail, achieved: false, deadlineAt: null },
        { isOwner: true },
      );
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "달성으로 표시" }));
      });

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["dashboard", "upcoming-deadlines"],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["dashboard", "difficulty-excitement"],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["dashboard", "achievement-stats"],
      });
    });

    it("'마감일 다시 설정' 클릭 → 인라인 date input 노출 → 확정 시 updateDeadline 호출", async () => {
      mockUpdateDeadline.mockResolvedValue({
        deadlineAt: new Date("2030-07-01T00:00:00Z"),
      });
      renderWithDetail(
        { ...baseDetail, achieved: false, deadlineAt: "2020-01-01T00:00:00Z" },
        { isOwner: true },
      );

      fireEvent.click(screen.getByRole("button", { name: "마감일 다시 설정" }));
      const input = screen.getByLabelText("새 마감일");
      expect(input).toBeInTheDocument();

      fireEvent.change(input, { target: { value: "2030-07-01" } });
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "확인" }));
      });

      expect(mockUpdateDeadline).toHaveBeenCalledWith(
        "item-1",
        new Date("2030-07-01"),
      );
    });

    it("'마감일 다시 설정' 확정 → upcomingDeadlines만 invalidate (difficultyExcitement/achievementStats/bucketCount은 영향 없음)", async () => {
      mockUpdateDeadline.mockResolvedValue({
        deadlineAt: new Date("2030-07-01T00:00:00Z"),
      });
      const { queryClient } = renderWithDetail(
        { ...baseDetail, achieved: false, deadlineAt: "2020-01-01T00:00:00Z" },
        { isOwner: true },
      );
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      fireEvent.click(screen.getByRole("button", { name: "마감일 다시 설정" }));
      fireEvent.change(screen.getByLabelText("새 마감일"), {
        target: { value: "2030-07-01" },
      });
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "확인" }));
      });

      expect(invalidateSpy).toHaveBeenCalledTimes(1);
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["dashboard", "upcoming-deadlines"],
      });
    });
  });
});
