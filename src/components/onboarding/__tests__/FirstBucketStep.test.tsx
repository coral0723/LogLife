import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";

import { FirstBucketStep } from "../FirstBucketStep";
import { createBucketList } from "@/actions/bucketList/actions";
import { completeOnboarding } from "@/actions/onboarding/actions";

const { MOCK_PLACE } = vi.hoisted(() => ({
  MOCK_PLACE: {
    placeId: "place-1",
    displayName: "도쿄 타워, 일본",
    lat: 35.6586,
    lng: 139.7454,
    countryCode: "JP",
  },
}));

vi.mock("@/components/bucket/PlacesAutocomplete", () => ({
  PlacesAutocomplete: ({ onSelect }: { onSelect: (place: typeof MOCK_PLACE) => void }) => (
    <button type="button" onClick={() => onSelect(MOCK_PLACE)}>
      장소 선택
    </button>
  ),
}));

vi.mock("@/actions/bucketList/actions", () => ({
  createBucketList: vi.fn(),
}));

vi.mock("@/actions/onboarding/actions", () => ({
  completeOnboarding: vi.fn(),
}));

vi.mock("@/lib/date/useTodayDateString", () => ({
  useTodayDateString: () => "2026-01-01",
}));

const mockCreateBucketList = vi.mocked(createBucketList);
const mockCompleteOnboarding = vi.mocked(completeOnboarding);

function fillRequiredFields(container: HTMLElement, title = "도쿄 여행") {
  fireEvent.change(container.querySelector('input[name="title"]')!, {
    target: { value: title },
  });
  fireEvent.click(screen.getByRole("button", { name: "장소 선택" }));
  fireEvent.change(container.querySelector('input[name="deadlineAt"]')!, {
    target: { value: "2026-12-31" },
  });
}

describe("FirstBucketStep", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("필수 항목(제목·위치·마감일) 입력 전 제출 버튼이 비활성화된다", () => {
    render(<FirstBucketStep />);
    expect(screen.getByRole("button", { name: "등록하고 시작하기" })).toBeDisabled();
  });

  it("필수 항목을 모두 입력하면 제출 버튼이 활성화된다", () => {
    const { container } = render(<FirstBucketStep />);

    fillRequiredFields(container);

    expect(screen.getByRole("button", { name: "등록하고 시작하기" })).toBeEnabled();
  });

  it("제목 입력 시 글자수 카운터가 갱신된다", () => {
    const { container } = render(<FirstBucketStep />);

    fireEvent.change(container.querySelector('input[name="title"]')!, {
      target: { value: "도쿄 여행" },
    });

    expect(screen.getByText("5/20")).toBeInTheDocument();
  });

  it("내용 입력 시 글자수 카운터가 갱신된다", () => {
    const { container } = render(<FirstBucketStep />);

    fireEvent.change(container.querySelector('textarea[name="description"]')!, {
      target: { value: "야경 보기" },
    });

    expect(screen.getByText("5/1000")).toBeInTheDocument();
  });

  it("난이도·설레임 기본값은 3점이며 클릭한 값으로 변경된다", () => {
    render(<FirstBucketStep />);
    const [difficultyGroup, excitementGroup] = screen.getAllByRole("radiogroup");

    expect(within(difficultyGroup).getByRole("radio", { name: "3점" })).toHaveAttribute(
      "aria-checked",
      "true"
    );

    fireEvent.click(within(difficultyGroup).getByRole("radio", { name: "5점" }));

    expect(within(difficultyGroup).getByRole("radio", { name: "5점" })).toHaveAttribute(
      "aria-checked",
      "true"
    );
    expect(within(excitementGroup).getByRole("radio", { name: "3점" })).toHaveAttribute(
      "aria-checked",
      "true"
    );
  });

  it("제출 시 createBucketList를 입력값으로 호출한다", async () => {
    mockCreateBucketList.mockResolvedValue(undefined as never);
    mockCompleteOnboarding.mockResolvedValue(undefined as never);
    const { container } = render(<FirstBucketStep />);

    fillRequiredFields(container);
    fireEvent.change(container.querySelector('textarea[name="description"]')!, {
      target: { value: "도쿄 타워 야경 보기" },
    });
    fireEvent.click(screen.getByRole("button", { name: "등록하고 시작하기" }));

    await waitFor(() => expect(mockCreateBucketList).toHaveBeenCalledTimes(1));
    expect(mockCreateBucketList).toHaveBeenCalledWith({
      title: "도쿄 여행",
      description: "도쿄 타워 야경 보기",
      visibility: "PUBLIC",
      deadlineAt: new Date("2026-12-31"),
      difficulty: 3,
      excitement: 3,
      ...MOCK_PLACE,
    });
  });

  it("createBucketList 성공 후 completeOnboarding을 호출한다", async () => {
    mockCreateBucketList.mockResolvedValue(undefined as never);
    mockCompleteOnboarding.mockResolvedValue(undefined as never);
    const { container } = render(<FirstBucketStep />);

    fillRequiredFields(container);
    fireEvent.click(screen.getByRole("button", { name: "등록하고 시작하기" }));

    await waitFor(() => expect(mockCompleteOnboarding).toHaveBeenCalledTimes(1));
  });

  it("createBucketList 실패 시 에러 메시지를 표시하고 completeOnboarding은 호출하지 않는다", async () => {
    mockCreateBucketList.mockRejectedValue(new Error("저장에 실패했습니다."));
    const { container } = render(<FirstBucketStep />);

    fillRequiredFields(container);
    fireEvent.click(screen.getByRole("button", { name: "등록하고 시작하기" }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("저장에 실패했습니다.")
    );
    expect(mockCompleteOnboarding).not.toHaveBeenCalled();
  });
});
