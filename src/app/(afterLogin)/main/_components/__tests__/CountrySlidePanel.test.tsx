import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { BucketDetail } from "@/api/bucketlists";
import { fetchBucketsByCountry, fetchBucketDetail } from "@/api/bucketlists";
import { CountrySlidePanel } from "../CountrySlidePanel";

vi.mock("@/api/bucketlists", () => ({
  fetchBucketsByCountry: vi.fn(),
  fetchBucketDetail: vi.fn(),
  bucketQueryKeys: {
    byCountry: (code: string) => ["bucketlists", "by-country", code],
    detail: (id: string) => ["bucketlists", "detail", id],
  },
}));

vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, onClick, className }: React.ComponentProps<"div">) => (
      <div onClick={onClick} className={className}>
        {children}
      </div>
    ),
  },
}));

vi.mock("@phosphor-icons/react", () => ({
  Camera: () => <span data-testid="icon-camera" />,
  CaretDown: () => <span />,
  Globe: () => <span />,
  Lock: () => <span />,
  Users: () => <span />,
}));

vi.mock("../BucketDetailView", () => ({
  BucketDetailView: ({
    bucketId,
    onBack,
  }: {
    bucketId: string;
    onBack?: () => void;
  }) => (
    <div data-testid="bucket-detail-view">
      <span>{bucketId}</span>
      {onBack && (
        <button onClick={onBack} aria-label="목록으로 돌아가기">
          뒤로가기
        </button>
      )}
    </div>
  ),
}));

const baseItem = {
  id: "item-1",
  title: "도쿄 타워 방문",
  displayName: "도쿄 타워, 일본",
  achieved: false,
  placeId: "place-123",
  visibility: "PUBLIC" as const,
  deadlineAt: null,
};

const sampleDetail: BucketDetail = {
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
  user: { username: "tester", name: "테스터", image: null },
};

function renderWithQuery(ui: React.ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return render(ui, { wrapper: Wrapper });
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

describe("CountrySlidePanel", () => {
  describe("렌더링 조건", () => {
    it("countryCode가 null이면 패널이 렌더링되지 않음", () => {
      renderWithQuery(<CountrySlidePanel countryCode={null} onClose={vi.fn()} />);
      expect(screen.queryByRole("button", { name: "닫기" })).not.toBeInTheDocument();
    });

    it("countryCode 'KR'이면 패널과 '대한민국' 표시", async () => {
      vi.mocked(fetchBucketsByCountry).mockResolvedValue({ items: [], nextCursor: null });
      await act(async () => {
        renderWithQuery(<CountrySlidePanel countryCode="KR" onClose={vi.fn()} />);
      });
      expect(screen.getByText("대한민국")).toBeInTheDocument();
    });

    it("인식 불가한 국가코드 'XX'는 코드 원문 그대로 표시", async () => {
      vi.mocked(fetchBucketsByCountry).mockResolvedValue({ items: [], nextCursor: null });
      await act(async () => {
        renderWithQuery(<CountrySlidePanel countryCode="XX" onClose={vi.fn()} />);
      });
      expect(screen.getByText("XX")).toBeInTheDocument();
    });
  });

  describe("초기 데이터 패치", () => {
    it("로딩 중 스켈레톤 3개 렌더링", () => {
      vi.mocked(fetchBucketsByCountry).mockReturnValue(new Promise(() => {}));
      const { container } = renderWithQuery(
        <CountrySlidePanel countryCode="KR" onClose={vi.fn()} />
      );
      expect(container.querySelectorAll("ul li")).toHaveLength(3);
    });

    it("패치 성공 시 아이템 title과 displayName 렌더링", async () => {
      vi.mocked(fetchBucketsByCountry).mockResolvedValue({ items: [baseItem], nextCursor: null });
      renderWithQuery(<CountrySlidePanel countryCode="KR" onClose={vi.fn()} />);
      await waitFor(() => {
        expect(screen.getByText("도쿄 타워 방문")).toBeInTheDocument();
        expect(screen.getByText("도쿄 타워, 일본")).toBeInTheDocument();
      });
    });

    it("패치 결과 빈 배열이면 '등록된 버킷리스트가 없습니다.' 표시", async () => {
      vi.mocked(fetchBucketsByCountry).mockResolvedValue({ items: [], nextCursor: null });
      renderWithQuery(<CountrySlidePanel countryCode="KR" onClose={vi.fn()} />);
      await waitFor(() =>
        expect(screen.getByText("등록된 버킷리스트가 없습니다.")).toBeInTheDocument()
      );
    });

    it("패치 실패 시 빈 목록 표시", async () => {
      vi.mocked(fetchBucketsByCountry).mockRejectedValue(new Error("Network error"));
      renderWithQuery(<CountrySlidePanel countryCode="KR" onClose={vi.fn()} />);
      await waitFor(() =>
        expect(screen.getByText("등록된 버킷리스트가 없습니다.")).toBeInTheDocument()
      );
    });

    it("countryCode 변경 시 이전 목록 초기화 후 새 패치 호출", async () => {
      vi.mocked(fetchBucketsByCountry)
        .mockResolvedValueOnce({ items: [baseItem], nextCursor: null })
        .mockResolvedValueOnce({ items: [], nextCursor: null });

      const { rerender } = renderWithQuery(
        <CountrySlidePanel countryCode="KR" onClose={vi.fn()} />
      );
      await waitFor(() =>
        expect(screen.getByText("도쿄 타워 방문")).toBeInTheDocument()
      );

      rerender(<CountrySlidePanel countryCode="JP" onClose={vi.fn()} />);
      await waitFor(() =>
        expect(screen.getByText("등록된 버킷리스트가 없습니다.")).toBeInTheDocument()
      );

      expect(vi.mocked(fetchBucketsByCountry)).toHaveBeenCalledTimes(2);
      expect(vi.mocked(fetchBucketsByCountry)).toHaveBeenLastCalledWith("JP", undefined);
    });
  });

  describe("상태 배지", () => {
    it("achieved: true 아이템은 '달성' 배지 표시", async () => {
      vi.mocked(fetchBucketsByCountry).mockResolvedValue({
        items: [{ ...baseItem, achieved: true }],
        nextCursor: null,
      });
      renderWithQuery(<CountrySlidePanel countryCode="KR" onClose={vi.fn()} />);
      await waitFor(() => expect(screen.getByText("달성")).toBeInTheDocument());
    });

    it("achieved: false이고 deadlineAt이 과거면 '마감' 배지 표시", async () => {
      vi.mocked(fetchBucketsByCountry).mockResolvedValue({
        items: [{ ...baseItem, deadlineAt: "2020-01-01T00:00:00Z" }],
        nextCursor: null,
      });
      renderWithQuery(<CountrySlidePanel countryCode="KR" onClose={vi.fn()} />);
      await waitFor(() => expect(screen.getByText("마감")).toBeInTheDocument());
    });

    it("achieved: false이고 deadlineAt: null이면 '진행 중' 배지 표시", async () => {
      vi.mocked(fetchBucketsByCountry).mockResolvedValue({ items: [baseItem], nextCursor: null });
      renderWithQuery(<CountrySlidePanel countryCode="KR" onClose={vi.fn()} />);
      await waitFor(() => expect(screen.getByText("진행 중")).toBeInTheDocument());
    });
  });

  describe("공개 범위 표시", () => {
    it.each([
      ["PUBLIC" as const, "전체 공개"],
      ["FRIENDS" as const, "친구 공개"],
      ["PRIVATE" as const, "비공개"],
    ])("%s → '%s' 표시", async (visibility, label) => {
      vi.mocked(fetchBucketsByCountry).mockResolvedValue({
        items: [{ ...baseItem, visibility }],
        nextCursor: null,
      });
      renderWithQuery(<CountrySlidePanel countryCode="KR" onClose={vi.fn()} />);
      await waitFor(() => expect(screen.getByText(label)).toBeInTheDocument());
    });
  });

  describe("인터랙션", () => {
    it("닫기 버튼 클릭 시 onClose 호출", async () => {
      vi.mocked(fetchBucketsByCountry).mockResolvedValue({ items: [], nextCursor: null });
      const onClose = vi.fn();
      await act(async () => {
        renderWithQuery(<CountrySlidePanel countryCode="KR" onClose={onClose} />);
      });
      fireEvent.click(screen.getByRole("button", { name: "닫기" }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("배경 오버레이 클릭 시 onClose 호출", async () => {
      vi.mocked(fetchBucketsByCountry).mockResolvedValue({ items: [], nextCursor: null });
      const onClose = vi.fn();
      let container!: HTMLElement;
      await act(async () => {
        ({ container } = renderWithQuery(
          <CountrySlidePanel countryCode="KR" onClose={onClose} />
        ));
      });
      fireEvent.click(container.children[0]);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("아이템 클릭 시 상세 API 호출 후 BucketDetailView 렌더링", async () => {
      vi.mocked(fetchBucketsByCountry).mockResolvedValue({ items: [baseItem], nextCursor: null });
      vi.mocked(fetchBucketDetail).mockResolvedValue(sampleDetail);
      renderWithQuery(<CountrySlidePanel countryCode="KR" onClose={vi.fn()} />);
      await waitFor(() =>
        expect(screen.getByText("도쿄 타워 방문")).toBeInTheDocument()
      );

      fireEvent.click(screen.getByText("도쿄 타워 방문"));

      await waitFor(() =>
        expect(screen.getByTestId("bucket-detail-view")).toBeInTheDocument()
      );
    });

    it("상세 API 실패 시 목록 뷰로 복귀", async () => {
      vi.mocked(fetchBucketsByCountry).mockResolvedValue({ items: [baseItem], nextCursor: null });
      vi.mocked(fetchBucketDetail).mockRejectedValue(new Error("상세 조회 실패"));

      renderWithQuery(<CountrySlidePanel countryCode="KR" onClose={vi.fn()} />);
      await waitFor(() =>
        expect(screen.getByText("도쿄 타워 방문")).toBeInTheDocument()
      );

      fireEvent.click(screen.getByText("도쿄 타워 방문"));

      await waitFor(() => {
        expect(screen.queryByTestId("bucket-detail-view")).not.toBeInTheDocument();
        expect(screen.getByText("도쿄 타워 방문")).toBeInTheDocument();
      });
    });

    it("BucketDetailView 뒤로가기 클릭 시 목록 뷰 복귀", async () => {
      vi.mocked(fetchBucketsByCountry).mockResolvedValue({ items: [baseItem], nextCursor: null });
      vi.mocked(fetchBucketDetail).mockResolvedValue(sampleDetail);
      renderWithQuery(<CountrySlidePanel countryCode="KR" onClose={vi.fn()} />);
      await waitFor(() =>
        expect(screen.getByText("도쿄 타워 방문")).toBeInTheDocument()
      );

      fireEvent.click(screen.getByText("도쿄 타워 방문"));
      await waitFor(() =>
        expect(screen.getByTestId("bucket-detail-view")).toBeInTheDocument()
      );

      fireEvent.click(screen.getByRole("button", { name: "목록으로 돌아가기" }));

      await waitFor(() => {
        expect(screen.queryByTestId("bucket-detail-view")).not.toBeInTheDocument();
        expect(screen.getByText("도쿄 타워 방문")).toBeInTheDocument();
      });
    });
  });

  describe("무한 스크롤", () => {
    it("nextCursor가 있을 때 sentinel이 보이면 2페이지 fetch 후 아이템 목록에 추가됨", async () => {
      const page1Item = { ...baseItem, id: "item-1", title: "1페이지 아이템" };
      const page2Item = { ...baseItem, id: "item-2", title: "2페이지 아이템" };
      vi.mocked(fetchBucketsByCountry)
        .mockResolvedValueOnce({ items: [page1Item], nextCursor: "cursor-abc" })
        .mockResolvedValueOnce({ items: [page2Item], nextCursor: null });

      renderWithQuery(<CountrySlidePanel countryCode="KR" onClose={vi.fn()} />);

      await waitFor(() => {
        expect(screen.getByText("1페이지 아이템")).toBeInTheDocument();
        expect(capturedIOCallback).not.toBeNull();
      });

      await act(async () => {
        capturedIOCallback!(
          [{ isIntersecting: true } as IntersectionObserverEntry],
          {} as IntersectionObserver
        );
      });

      await waitFor(() => {
        expect(screen.getByText("1페이지 아이템")).toBeInTheDocument();
        expect(screen.getByText("2페이지 아이템")).toBeInTheDocument();
      });

      expect(vi.mocked(fetchBucketsByCountry)).toHaveBeenCalledTimes(2);
      expect(vi.mocked(fetchBucketsByCountry)).toHaveBeenLastCalledWith("KR", "cursor-abc");
    });

    it("isIntersecting: false일 때 추가 fetch 없음", async () => {
      vi.mocked(fetchBucketsByCountry).mockResolvedValue({
        items: [baseItem],
        nextCursor: "cursor-abc",
      });

      renderWithQuery(<CountrySlidePanel countryCode="KR" onClose={vi.fn()} />);

      await waitFor(() => {
        expect(screen.getByText("도쿄 타워 방문")).toBeInTheDocument();
        expect(capturedIOCallback).not.toBeNull();
      });

      await act(async () => {
        capturedIOCallback!(
          [{ isIntersecting: false } as IntersectionObserverEntry],
          {} as IntersectionObserver
        );
      });

      expect(vi.mocked(fetchBucketsByCountry)).toHaveBeenCalledTimes(1);
    });
  });

  describe("사진 썸네일", () => {
    it("img 로드 실패 시 Camera 아이콘으로 대체", async () => {
      vi.mocked(fetchBucketsByCountry).mockResolvedValue({ items: [baseItem], nextCursor: null });
      const { container } = renderWithQuery(
        <CountrySlidePanel countryCode="KR" onClose={vi.fn()} />
      );

      await waitFor(() => expect(container.querySelector("img")).toBeTruthy());

      fireEvent.error(container.querySelector("img")!);

      expect(container.querySelector("img")).toBeNull();
      expect(screen.getByTestId("icon-camera")).toBeInTheDocument();
    });
  });
});
