import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import type { BucketDetail } from "../BucketDetailView";
import { CountrySlidePanel } from "../CountrySlidePanel";

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
    detail,
    onBack,
  }: {
    detail: BucketDetail;
    onBack?: () => void;
  }) => (
    <div data-testid="bucket-detail-view">
      <span>{detail.title}</span>
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
  cityName: null,
  admin1Code: null,
  countryCode: "JP",
  shareToken: "token-abc",
};

function stubFetch(data: { items: object[]; nextCursor: string | null }) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(data),
    })
  );
}

function stubFetchWithDetail() {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockImplementation((url: string) =>
      url.includes("/api/bucketlists/item-1")
        ? Promise.resolve({ ok: true, json: () => Promise.resolve(sampleDetail) })
        : Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ items: [baseItem], nextCursor: null }),
          })
    )
  );
}

let capturedIOCallback: IntersectionObserverCallback | null = null;

beforeEach(() => {
  capturedIOCallback = null;
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
      render(<CountrySlidePanel countryCode={null} onClose={vi.fn()} />);
      expect(screen.queryByRole("button", { name: "닫기" })).not.toBeInTheDocument();
    });

    it("countryCode 'KR'이면 패널과 '대한민국' 표시", async () => {
      stubFetch({ items: [], nextCursor: null });
      await act(async () => {
        render(<CountrySlidePanel countryCode="KR" onClose={vi.fn()} />);
      });
      expect(screen.getByText("대한민국")).toBeInTheDocument();
    });

    it("인식 불가한 국가코드 'XX'는 코드 원문 그대로 표시", async () => {
      stubFetch({ items: [], nextCursor: null });
      await act(async () => {
        render(<CountrySlidePanel countryCode="XX" onClose={vi.fn()} />);
      });
      expect(screen.getByText("XX")).toBeInTheDocument();
    });
  });

  describe("초기 데이터 패치", () => {
    it("로딩 중 스켈레톤 3개 렌더링", () => {
      vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => {})));
      const { container } = render(
        <CountrySlidePanel countryCode="KR" onClose={vi.fn()} />
      );
      expect(container.querySelectorAll("ul li")).toHaveLength(3);
    });

    it("패치 성공 시 아이템 title과 displayName 렌더링", async () => {
      stubFetch({ items: [baseItem], nextCursor: null });
      render(<CountrySlidePanel countryCode="KR" onClose={vi.fn()} />);
      await waitFor(() => {
        expect(screen.getByText("도쿄 타워 방문")).toBeInTheDocument();
        expect(screen.getByText("도쿄 타워, 일본")).toBeInTheDocument();
      });
    });

    it("패치 결과 빈 배열이면 '등록된 버킷리스트가 없습니다.' 표시", async () => {
      stubFetch({ items: [], nextCursor: null });
      render(<CountrySlidePanel countryCode="KR" onClose={vi.fn()} />);
      await waitFor(() =>
        expect(screen.getByText("등록된 버킷리스트가 없습니다.")).toBeInTheDocument()
      );
    });

    it("패치 실패 시 빈 목록 표시", async () => {
      vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network error")));
      render(<CountrySlidePanel countryCode="KR" onClose={vi.fn()} />);
      await waitFor(() =>
        expect(screen.getByText("등록된 버킷리스트가 없습니다.")).toBeInTheDocument()
      );
    });

    it("countryCode 변경 시 이전 목록 초기화 후 새 패치 호출", async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ items: [baseItem], nextCursor: null }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ items: [], nextCursor: null }),
        });
      vi.stubGlobal("fetch", fetchMock);

      const { rerender } = render(
        <CountrySlidePanel countryCode="KR" onClose={vi.fn()} />
      );
      await waitFor(() =>
        expect(screen.getByText("도쿄 타워 방문")).toBeInTheDocument()
      );

      rerender(<CountrySlidePanel countryCode="JP" onClose={vi.fn()} />);
      await waitFor(() =>
        expect(screen.getByText("등록된 버킷리스트가 없습니다.")).toBeInTheDocument()
      );

      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock).toHaveBeenLastCalledWith(
        expect.stringContaining("countryCode=JP")
      );
    });
  });

  describe("상태 배지", () => {
    it("achieved: true 아이템은 '달성' 배지 표시", async () => {
      stubFetch({ items: [{ ...baseItem, achieved: true }], nextCursor: null });
      render(<CountrySlidePanel countryCode="KR" onClose={vi.fn()} />);
      await waitFor(() => expect(screen.getByText("달성")).toBeInTheDocument());
    });

    it("achieved: false이고 deadlineAt이 과거면 '마감' 배지 표시", async () => {
      stubFetch({
        items: [{ ...baseItem, deadlineAt: "2020-01-01T00:00:00Z" }],
        nextCursor: null,
      });
      render(<CountrySlidePanel countryCode="KR" onClose={vi.fn()} />);
      await waitFor(() => expect(screen.getByText("마감")).toBeInTheDocument());
    });

    it("achieved: false이고 deadlineAt: null이면 '진행 중' 배지 표시", async () => {
      stubFetch({ items: [baseItem], nextCursor: null });
      render(<CountrySlidePanel countryCode="KR" onClose={vi.fn()} />);
      await waitFor(() => expect(screen.getByText("진행 중")).toBeInTheDocument());
    });
  });

  describe("공개 범위 표시", () => {
    it.each([
      ["PUBLIC" as const, "전체 공개"],
      ["FRIENDS" as const, "친구 공개"],
      ["PRIVATE" as const, "비공개"],
    ])("%s → '%s' 표시", async (visibility, label) => {
      stubFetch({ items: [{ ...baseItem, visibility }], nextCursor: null });
      render(<CountrySlidePanel countryCode="KR" onClose={vi.fn()} />);
      await waitFor(() => expect(screen.getByText(label)).toBeInTheDocument());
    });
  });

  describe("인터랙션", () => {
    it("닫기 버튼 클릭 시 onClose 호출", async () => {
      stubFetch({ items: [], nextCursor: null });
      const onClose = vi.fn();
      await act(async () => {
        render(<CountrySlidePanel countryCode="KR" onClose={onClose} />);
      });
      fireEvent.click(screen.getByRole("button", { name: "닫기" }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("배경 오버레이 클릭 시 onClose 호출", async () => {
      stubFetch({ items: [], nextCursor: null });
      const onClose = vi.fn();
      let container!: HTMLElement;
      await act(async () => {
        ({ container } = render(
          <CountrySlidePanel countryCode="KR" onClose={onClose} />
        ));
      });
      fireEvent.click(container.children[0]);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("아이템 클릭 시 상세 API 호출 후 BucketDetailView 렌더링", async () => {
      stubFetchWithDetail();
      render(<CountrySlidePanel countryCode="KR" onClose={vi.fn()} />);
      await waitFor(() =>
        expect(screen.getByText("도쿄 타워 방문")).toBeInTheDocument()
      );

      fireEvent.click(screen.getByText("도쿄 타워 방문"));

      await waitFor(() =>
        expect(screen.getByTestId("bucket-detail-view")).toBeInTheDocument()
      );
    });

    it("상세 API 실패 시 목록 뷰로 복귀", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockImplementation((url: string) =>
          url.includes("/api/bucketlists/item-1")
            ? Promise.resolve({ ok: false, json: () => Promise.resolve({}) })
            : Promise.resolve({
                ok: true,
                json: () =>
                  Promise.resolve({ items: [baseItem], nextCursor: null }),
              })
        )
      );

      render(<CountrySlidePanel countryCode="KR" onClose={vi.fn()} />);
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
      stubFetchWithDetail();
      render(<CountrySlidePanel countryCode="KR" onClose={vi.fn()} />);
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
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ items: [page1Item], nextCursor: "cursor-abc" }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ items: [page2Item], nextCursor: null }),
        });
      vi.stubGlobal("fetch", fetchMock);

      render(<CountrySlidePanel countryCode="KR" onClose={vi.fn()} />);

      // page1 로드 완료 + IO 콜백 등록 대기 (nextCursor 갱신 후 IO effect 재실행)
      await waitFor(() => {
        expect(screen.getByText("1페이지 아이템")).toBeInTheDocument();
        expect(capturedIOCallback).not.toBeNull();
      });

      // sentinel이 화면에 진입한 상황 시뮬레이션
      await act(async () => {
        capturedIOCallback!(
          [{ isIntersecting: true } as IntersectionObserverEntry],
          {} as IntersectionObserver
        );
      });

      // page2 아이템이 page1 아이템과 함께 목록에 추가됨
      await waitFor(() => {
        expect(screen.getByText("1페이지 아이템")).toBeInTheDocument();
        expect(screen.getByText("2페이지 아이템")).toBeInTheDocument();
      });

      // 두 번째 fetch는 cursor 파라미터 포함
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock).toHaveBeenLastCalledWith(
        expect.stringContaining("cursor=cursor-abc")
      );
    });

    it("isIntersecting: false일 때 추가 fetch 없음", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ items: [baseItem], nextCursor: "cursor-abc" }),
      });
      vi.stubGlobal("fetch", fetchMock);

      render(<CountrySlidePanel countryCode="KR" onClose={vi.fn()} />);

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

      // isIntersecting: false이므로 초기 fetch 1회만 호출
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("PhotoCell", () => {
    it("img 로드 실패 시 Camera 아이콘으로 대체", async () => {
      stubFetch({ items: [baseItem], nextCursor: null });
      const { container } = render(
        <CountrySlidePanel countryCode="KR" onClose={vi.fn()} />
      );

      // alt=""인 img는 ARIA role이 "presentation"이므로 querySelector로 탐색
      await waitFor(() => expect(container.querySelector("img")).toBeTruthy());

      fireEvent.error(container.querySelector("img")!);

      expect(container.querySelector("img")).toBeNull();
      expect(screen.getByTestId("icon-camera")).toBeInTheDocument();
    });
  });
});
