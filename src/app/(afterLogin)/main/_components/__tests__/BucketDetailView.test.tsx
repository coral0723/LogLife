import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { BucketDetailView } from "../BucketDetailView";
import type { BucketDetail } from "../BucketDetailView";

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

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("navigator", {
    clipboard: {
      writeText: vi.fn().mockResolvedValue(undefined),
    },
  });
  // jsdom의 window.location.origin은 'http://localhost'
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("BucketDetailView", () => {
  describe("상태 배지", () => {
    it("achieved: true → '달성' 배지 표시", () => {
      render(<BucketDetailView detail={{ ...baseDetail, achieved: true }} />);
      expect(screen.getByText("달성")).toBeInTheDocument();
    });

    it("achieved: false + 과거 deadlineAt → '마감' 배지 표시", () => {
      vi.setSystemTime(new Date("2026-06-03T00:00:00Z"));
      render(
        <BucketDetailView
          detail={{ ...baseDetail, achieved: false, deadlineAt: "2020-01-01T00:00:00Z" }}
        />
      );
      expect(screen.getByText("마감")).toBeInTheDocument();
    });

    it("achieved: false + 미래 deadlineAt → '진행 중' 배지 표시", () => {
      vi.setSystemTime(new Date("2026-06-03T00:00:00Z"));
      render(
        <BucketDetailView
          detail={{ ...baseDetail, achieved: false, deadlineAt: "2030-01-01T00:00:00Z" }}
        />
      );
      expect(screen.getByText("진행 중")).toBeInTheDocument();
    });

    it("achieved: false + deadlineAt null → '진행 중' 배지 표시", () => {
      render(
        <BucketDetailView detail={{ ...baseDetail, achieved: false, deadlineAt: null }} />
      );
      expect(screen.getByText("진행 중")).toBeInTheDocument();
    });

    it("achieved: true + 과거 deadlineAt → achieved 우선으로 '달성' 배지 표시", () => {
      vi.setSystemTime(new Date("2026-06-03T00:00:00Z"));
      render(
        <BucketDetailView
          detail={{ ...baseDetail, achieved: true, deadlineAt: "2020-01-01T00:00:00Z" }}
        />
      );
      expect(screen.getByText("달성")).toBeInTheDocument();
      expect(screen.queryByText("마감")).not.toBeInTheDocument();
    });
  });

  describe("공개 범위", () => {
    it("PUBLIC → '전체 공개' 표시", () => {
      render(<BucketDetailView detail={{ ...baseDetail, visibility: "PUBLIC" }} />);
      expect(screen.getByText("전체 공개")).toBeInTheDocument();
    });

    it("FRIENDS → '친구 공개' 표시", () => {
      render(<BucketDetailView detail={{ ...baseDetail, visibility: "FRIENDS" }} />);
      expect(screen.getByText("친구 공개")).toBeInTheDocument();
    });

    it("PRIVATE → '비공개' 표시", () => {
      render(<BucketDetailView detail={{ ...baseDetail, visibility: "PRIVATE" }} />);
      expect(screen.getByText("비공개")).toBeInTheDocument();
    });
  });

  describe("기본 콘텐츠", () => {
    it("title 표시", () => {
      render(<BucketDetailView detail={baseDetail} />);
      expect(screen.getByText("도쿄 타워 방문")).toBeInTheDocument();
    });

    it("displayName 표시", () => {
      render(<BucketDetailView detail={baseDetail} />);
      expect(screen.getByText("도쿄 타워, 일본")).toBeInTheDocument();
    });

    it("description 있으면 렌더링", () => {
      render(
        <BucketDetailView detail={{ ...baseDetail, description: "멋진 야경을 보고 싶다" }} />
      );
      expect(screen.getByText("멋진 야경을 보고 싶다")).toBeInTheDocument();
    });

    it("description null이면 렌더링 안 함", () => {
      render(<BucketDetailView detail={{ ...baseDetail, description: null }} />);
      expect(screen.queryByText("멋진 야경을 보고 싶다")).not.toBeInTheDocument();
    });
  });

  describe("DotRating", () => {
    function getFilledDots(container: HTMLElement, label: string): number {
      // 라벨 텍스트 다음 형제 div의 자식 span 중 bg-zinc-800 클래스 수
      const labelEl = Array.from(container.querySelectorAll("p")).find(
        (p) => p.textContent === label
      );
      const ratingDiv = labelEl?.nextElementSibling;
      return ratingDiv
        ? Array.from(ratingDiv.querySelectorAll("span")).filter((s) =>
            s.classList.contains("bg-zinc-800")
          ).length
        : 0;
    }

    function getEmptyDots(container: HTMLElement, label: string): number {
      const labelEl = Array.from(container.querySelectorAll("p")).find(
        (p) => p.textContent === label
      );
      const ratingDiv = labelEl?.nextElementSibling;
      return ratingDiv
        ? Array.from(ratingDiv.querySelectorAll("span")).filter((s) =>
            s.classList.contains("bg-zinc-200")
          ).length
        : 0;
    }

    it("difficulty 3 → 채워진 점 3개, 빈 점 2개", () => {
      const { container } = render(
        <BucketDetailView detail={{ ...baseDetail, difficulty: 3 }} />
      );
      expect(getFilledDots(container, "난이도")).toBe(3);
      expect(getEmptyDots(container, "난이도")).toBe(2);
    });

    it("excitement 값만큼 채워진 점 렌더링", () => {
      const { container } = render(
        <BucketDetailView detail={{ ...baseDetail, excitement: 2 }} />
      );
      expect(getFilledDots(container, "설레임")).toBe(2);
      expect(getEmptyDots(container, "설레임")).toBe(3);
    });

    it("difficulty 0 → 모두 빈 점 5개", () => {
      const { container } = render(
        <BucketDetailView detail={{ ...baseDetail, difficulty: 0 }} />
      );
      expect(getFilledDots(container, "난이도")).toBe(0);
      expect(getEmptyDots(container, "난이도")).toBe(5);
    });

    it("excitement 5 → 모두 채워진 점 5개", () => {
      const { container } = render(
        <BucketDetailView detail={{ ...baseDetail, excitement: 5 }} />
      );
      expect(getFilledDots(container, "설레임")).toBe(5);
      expect(getEmptyDots(container, "설레임")).toBe(0);
    });
  });

  describe("날짜", () => {
    it("deadlineAt 있고 achieved false → 마감일 한국어 형식 표시", () => {
      vi.setSystemTime(new Date("2026-06-03T00:00:00Z"));
      render(
        <BucketDetailView
          detail={{ ...baseDetail, achieved: false, deadlineAt: "2030-12-31T00:00:00Z" }}
        />
      );
      // ko-KR Intl 포맷: '2030년 12월 31일'
      expect(screen.getByText(/마감일:.*2030/)).toBeInTheDocument();
    });

    it("deadlineAt 있고 achieved true → 마감일 표시 안 함", () => {
      render(
        <BucketDetailView
          detail={{ ...baseDetail, achieved: true, deadlineAt: "2030-12-31T00:00:00Z" }}
        />
      );
      expect(screen.queryByText(/마감일:/)).not.toBeInTheDocument();
    });

    it("deadlineAt null → 마감일 표시 안 함", () => {
      render(<BucketDetailView detail={{ ...baseDetail, deadlineAt: null }} />);
      expect(screen.queryByText(/마감일:/)).not.toBeInTheDocument();
    });

    it("achievedAt 있으면 달성일 표시", () => {
      render(
        <BucketDetailView
          detail={{ ...baseDetail, achieved: true, achievedAt: "2025-03-15T00:00:00Z" }}
        />
      );
      expect(screen.getByText(/달성일:.*2025/)).toBeInTheDocument();
    });

    it("achievedAt null → 달성일 표시 안 함", () => {
      render(<BucketDetailView detail={{ ...baseDetail, achievedAt: null }} />);
      expect(screen.queryByText(/달성일:/)).not.toBeInTheDocument();
    });
  });

  describe("사진", () => {
    it("photoSrc prop 있으면 해당 URL로 img 렌더링", () => {
      const { container } = render(
        <BucketDetailView detail={baseDetail} photoSrc="https://example.com/photo.jpg" />
      );
      const img = container.querySelector("img");
      expect(img).not.toBeNull();
      expect(img!.src).toBe("https://example.com/photo.jpg");
    });

    it("photoSrc 없으면 /api/places/photo?placeId=... URL로 img 렌더링", () => {
      const { container } = render(<BucketDetailView detail={baseDetail} />);
      const img = container.querySelector("img");
      expect(img).not.toBeNull();
      expect(img!.src).toContain("/api/places/photo?placeId=place-123");
    });

    it("img 로드 실패 → Camera 아이콘 폴백 표시", () => {
      const { container } = render(<BucketDetailView detail={baseDetail} />);
      const img = container.querySelector("img");
      expect(img).not.toBeNull();

      fireEvent.error(img!);

      expect(container.querySelector("img")).toBeNull();
      expect(screen.getByTestId("icon-camera")).toBeInTheDocument();
    });

    it("img 로드 성공 → Camera 아이콘 없음", () => {
      render(<BucketDetailView detail={baseDetail} />);
      expect(screen.queryByTestId("icon-camera")).not.toBeInTheDocument();
    });
  });

  describe("뒤로가기 버튼", () => {
    it("onBack 있으면 뒤로가기 버튼 렌더링", () => {
      render(<BucketDetailView detail={baseDetail} onBack={vi.fn()} />);
      expect(
        screen.getByRole("button", { name: "목록으로 돌아가기" })
      ).toBeInTheDocument();
    });

    it("onBack 없으면 뒤로가기 버튼 없음", () => {
      render(<BucketDetailView detail={baseDetail} />);
      expect(
        screen.queryByRole("button", { name: "목록으로 돌아가기" })
      ).not.toBeInTheDocument();
    });

    it("뒤로가기 버튼 클릭 → onBack 호출", () => {
      const onBack = vi.fn();
      render(<BucketDetailView detail={baseDetail} onBack={onBack} />);
      fireEvent.click(screen.getByRole("button", { name: "목록으로 돌아가기" }));
      expect(onBack).toHaveBeenCalledTimes(1);
    });
  });

  describe("공유 버튼", () => {
    it("PUBLIC → 공유하기 버튼 렌더링", () => {
      render(<BucketDetailView detail={baseDetail} />);
      expect(screen.getByRole("button", { name: "공유하기" })).toBeInTheDocument();
    });

    it("PRIVATE → 공유하기 버튼 없음", () => {
      render(<BucketDetailView detail={{ ...baseDetail, visibility: "PRIVATE" }} />);
      expect(screen.queryByRole("button", { name: "공유하기" })).not.toBeInTheDocument();
    });

    it("FRIENDS → 공유하기 버튼 없음", () => {
      render(<BucketDetailView detail={{ ...baseDetail, visibility: "FRIENDS" }} />);
      expect(screen.queryByRole("button", { name: "공유하기" })).not.toBeInTheDocument();
    });

    it("클릭 시 clipboard.writeText에 올바른 URL(/b/{shareToken}) 전달", async () => {
      render(<BucketDetailView detail={{ ...baseDetail, shareToken: "token-abc" }} />);
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "공유하기" }));
      });
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        "http://localhost:3000/b/token-abc"
      );
    });

    it("클릭 직후 '링크 복사됨' 텍스트 표시", async () => {
      render(<BucketDetailView detail={baseDetail} />);
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "공유하기" }));
      });
      expect(screen.getByText("링크 복사됨")).toBeInTheDocument();
    });

    it("2초 후 '링크 복사됨' 사라짐", async () => {
      render(<BucketDetailView detail={baseDetail} />);
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
});
