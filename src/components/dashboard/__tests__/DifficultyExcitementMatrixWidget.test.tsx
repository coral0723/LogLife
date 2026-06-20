import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { DifficultyExcitementMatrixWidget } from "../DifficultyExcitementMatrixWidget";
import { fetchDifficultyExcitementMatrix } from "@/api/dashboard";
import type { DifficultyExcitementItem } from "@/lib/bucketList/difficultyExcitementMatrix";

vi.mock("@/api/dashboard", () => ({
  fetchDifficultyExcitementMatrix: vi.fn(),
  dashboardQueryKeys: {
    difficultyExcitement: () => ["dashboard", "difficulty-excitement"],
  },
}));

vi.mock("@phosphor-icons/react", () => ({
  Confetti: () => <span data-testid="icon-confetti" />,
}));

vi.mock("../MatrixSlidePanel", () => ({
  MatrixSlidePanel: ({
    label,
    items,
    onClose,
  }: {
    label: string | null;
    items: DifficultyExcitementItem[];
    onClose: () => void;
  }) =>
    label ? (
      <div data-testid="matrix-slide-panel">
        <span>{label}</span>
        <span>{items.length}</span>
        <button onClick={onClose}>닫기</button>
      </div>
    ) : null,
}));

const mockFetchMatrix = vi.mocked(fetchDifficultyExcitementMatrix);

function makeItem(overrides: Partial<DifficultyExcitementItem> = {}): DifficultyExcitementItem {
  return {
    id: "1",
    title: "항목",
    displayName: "사용자",
    placeId: "place-1",
    difficulty: 1,
    excitement: 1,
    deadlineAt: null,
    visibility: "PUBLIC",
    ...overrides,
  };
}

function renderWidget(isOpen: boolean) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(<DifficultyExcitementMatrixWidget isOpen={isOpen} />, { wrapper: Wrapper });
}

describe("DifficultyExcitementMatrixWidget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("로딩 중에는 4개 사분면 모두 스켈레톤을 표시한다", () => {
    mockFetchMatrix.mockImplementation(() => new Promise(() => {}));
    renderWidget(true);

    expect(document.querySelectorAll(".animate-pulse")).toHaveLength(4);
  });

  it("fetchDifficultyExcitementMatrix 실패 시 에러 메시지를 표시한다", async () => {
    mockFetchMatrix.mockRejectedValue(new Error("실패"));
    renderWidget(true);

    expect(await screen.findByText("매트릭스를 불러오지 못했어요")).toBeInTheDocument();
  });

  it("빈 배열인 경우 안내 문구와 아이콘을 표시한다", async () => {
    mockFetchMatrix.mockResolvedValue([]);
    renderWidget(true);

    expect(await screen.findByText("아직 표시할 항목이 없어요")).toBeInTheDocument();
    expect(screen.getByText("새로운 버킷리스트를 추가해보세요")).toBeInTheDocument();
    expect(screen.getByTestId("icon-confetti")).toBeInTheDocument();
  });

  it("정상 데이터 로드 후 각 사분면의 라벨·항목과 좌표축을 표시한다", async () => {
    mockFetchMatrix.mockResolvedValue([
      makeItem({ id: "1", title: "챌린지 항목", difficulty: 2, excitement: 4 }), // challengeNow
      makeItem({ id: "2", title: "보석 항목", difficulty: 4, excitement: 4 }), // bucketListGem
      makeItem({ id: "3", title: "여유 항목", difficulty: 2, excitement: 2 }), // relaxedTime
      makeItem({ id: "4", title: "천천히 항목", difficulty: 4, excitement: 2 }), // slowAndSteady
    ]);
    renderWidget(true);

    expect(await screen.findByText("챌린지 항목")).toBeInTheDocument();
    expect(screen.getByText("보석 항목")).toBeInTheDocument();
    expect(screen.getByText("여유 항목")).toBeInTheDocument();
    expect(screen.getByText("천천히 항목")).toBeInTheDocument();

    expect(screen.getByText("지금 도전!")).toBeInTheDocument();
    expect(screen.getByText("버킷리스트의 꽃")).toBeInTheDocument();
    expect(screen.getByText("여유 있을 때")).toBeInTheDocument();
    expect(screen.getByText("마음먹고 천천히")).toBeInTheDocument();

    expect(screen.getByText("난이도")).toBeInTheDocument();
    expect(screen.getByText("설렘")).toBeInTheDocument();
  });

  it("항목 없는 사분면은 '아직 없어요'를 표시하고 버튼이 비활성화된다", async () => {
    mockFetchMatrix.mockResolvedValue([
      makeItem({ id: "1", title: "유일 항목", difficulty: 2, excitement: 4 }), // challengeNow
    ]);
    renderWidget(true);

    await screen.findByText("유일 항목");

    const emptyLabels = screen.getAllByText("아직 없어요");
    expect(emptyLabels).toHaveLength(3);
    emptyLabels.forEach((label) => {
      expect(label.closest("button")).toBeDisabled();
    });
  });

  it("항목 있는 사분면을 클릭하면 MatrixSlidePanel에 라벨과 항목이 전달된다", async () => {
    mockFetchMatrix.mockResolvedValue([
      makeItem({ id: "1", title: "챌린지 항목", difficulty: 2, excitement: 4 }), // challengeNow
    ]);
    renderWidget(true);

    const cell = (await screen.findByText("챌린지 항목")).closest("button");
    expect(cell).not.toBeNull();
    fireEvent.click(cell!);

    const panel = await screen.findByTestId("matrix-slide-panel");
    expect(panel).toHaveTextContent("지금 도전!");
    expect(panel).toHaveTextContent("1");
  });

  it("MatrixSlidePanel에서 닫기를 호출하면 패널이 사라진다", async () => {
    mockFetchMatrix.mockResolvedValue([
      makeItem({ id: "1", title: "챌린지 항목", difficulty: 2, excitement: 4 }), // challengeNow
    ]);
    renderWidget(true);

    const cell = (await screen.findByText("챌린지 항목")).closest("button");
    fireEvent.click(cell!);
    await screen.findByTestId("matrix-slide-panel");

    fireEvent.click(screen.getByText("닫기"));

    expect(screen.queryByTestId("matrix-slide-panel")).not.toBeInTheDocument();
  });

  it("한 사분면에 항목이 6개 이상이면 모바일/데스크톱 더보기 문구를 표시한다", async () => {
    mockFetchMatrix.mockResolvedValue(
      Array.from({ length: 6 }, (_, i) =>
        makeItem({ id: `item-${i}`, title: `항목${i}`, difficulty: 2, excitement: 4 })
      )
    );
    renderWidget(true);

    await screen.findByText("항목0");

    expect(screen.getByText("+4개 더보기")).toBeInTheDocument();
    expect(screen.getByText("+1개 더보기")).toBeInTheDocument();
  });

  it("isOpen=false면 쿼리가 비활성화되어 fetch가 호출되지 않는다", () => {
    mockFetchMatrix.mockResolvedValue([]);
    renderWidget(false);

    expect(mockFetchMatrix).not.toHaveBeenCalled();
  });

  it("isOpen이 false에서 true로 바뀌면 fetch가 호출된다", () => {
    mockFetchMatrix.mockResolvedValue([]);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { rerender } = render(<DifficultyExcitementMatrixWidget isOpen={false} />, { wrapper: Wrapper });

    expect(mockFetchMatrix).not.toHaveBeenCalled();

    rerender(<DifficultyExcitementMatrixWidget isOpen={true} />);

    expect(mockFetchMatrix).toHaveBeenCalled();
  });
});
