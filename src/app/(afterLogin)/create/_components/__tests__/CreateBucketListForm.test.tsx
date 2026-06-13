import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";

import { CreateBucketListForm } from "../CreateBucketListForm";
import { createBucketList } from "@/actions/bucketList/actions";

const { MOCK_PLACE, mockPush } = vi.hoisted(() => ({
  MOCK_PLACE: {
    placeId: "place-1",
    displayName: "도쿄 타워, 일본",
    lat: 35.6586,
    lng: 139.7454,
    countryCode: "JP",
  },
  mockPush: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/actions/bucketList/actions", () => ({
  createBucketList: vi.fn(),
}));

vi.mock("@/app/(afterLogin)/_components/PlacesAutocomplete", () => ({
  PlacesAutocomplete: ({ onSelect }: { onSelect: (place: typeof MOCK_PLACE) => void }) => (
    <button type="button" onClick={() => onSelect(MOCK_PLACE)}>
      장소 선택
    </button>
  ),
}));

const mockCreateBucketList = vi.mocked(createBucketList);

function fillRequiredFields(container: HTMLElement, title = "도쿄 여행") {
  fireEvent.change(container.querySelector('input[name="title"]')!, {
    target: { value: title },
  });
  fireEvent.click(screen.getByRole("button", { name: "장소 선택" }));
  fireEvent.change(container.querySelector('input[name="deadlineAt"]')!, {
    target: { value: "2026-12-31" },
  });
}

describe("CreateBucketListForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("필수 항목(제목·위치·마감일)을 입력하기 전에는 제출 버튼이 비활성화된다", () => {
    render(<CreateBucketListForm />);

    expect(screen.getByRole("button", { name: "작성하기" })).toBeDisabled();
  });

  it("제목·위치·마감일을 모두 입력하면 제출 버튼이 활성화된다", () => {
    const { container } = render(<CreateBucketListForm />);

    fillRequiredFields(container);

    expect(screen.getByRole("button", { name: "작성하기" })).toBeEnabled();
  });

  it("제목 입력 시 글자수 카운터가 갱신된다", () => {
    const { container } = render(<CreateBucketListForm />);

    fireEvent.change(container.querySelector('input[name="title"]')!, {
      target: { value: "도쿄 여행" },
    });

    expect(screen.getByText("5/20")).toBeInTheDocument();
  });

  it("내용 입력 시 글자수 카운터가 갱신된다", () => {
    const { container } = render(<CreateBucketListForm />);

    fireEvent.change(container.querySelector('textarea[name="description"]')!, {
      target: { value: "야경" },
    });

    expect(screen.getByText("2/1000")).toBeInTheDocument();
  });

  it("난이도·설레임 기본값은 3점이며 클릭한 값으로 변경된다", () => {
    render(<CreateBucketListForm />);

    const [difficultyGroup, excitementGroup] = screen.getAllByRole("radiogroup");

    expect(within(difficultyGroup).getByRole("radio", { name: "3점" })).toHaveAttribute(
      "aria-checked",
      "true",
    );

    fireEvent.click(within(difficultyGroup).getByRole("radio", { name: "5점" }));

    expect(within(difficultyGroup).getByRole("radio", { name: "5점" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(within(excitementGroup).getByRole("radio", { name: "3점" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("제출 시 입력값과 선택한 장소 정보로 createBucketList를 호출한다", async () => {
    mockCreateBucketList.mockResolvedValue({ id: "bucket-1", shareToken: "token-1" });
    const { container } = render(<CreateBucketListForm />);

    fillRequiredFields(container);
    fireEvent.change(container.querySelector('textarea[name="description"]')!, {
      target: { value: "도쿄 타워 야경 보기" },
    });

    fireEvent.click(screen.getByRole("button", { name: "작성하기" }));

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

  it("onSuccess prop이 없으면 제출 성공 시 /main으로 이동한다", async () => {
    mockCreateBucketList.mockResolvedValue({ id: "bucket-1", shareToken: "token-1" });
    const { container } = render(<CreateBucketListForm />);

    fillRequiredFields(container);
    fireEvent.click(screen.getByRole("button", { name: "작성하기" }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/main"));
  });

  it("onSuccess prop이 있으면 제출 성공 시 onSuccess만 호출되고 /main 이동은 하지 않는다", async () => {
    mockCreateBucketList.mockResolvedValue({ id: "bucket-1", shareToken: "token-1" });
    const onSuccess = vi.fn();
    const { container } = render(<CreateBucketListForm onSuccess={onSuccess} />);

    fillRequiredFields(container);
    fireEvent.click(screen.getByRole("button", { name: "작성하기" }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("createBucketList 실패 시 에러 메시지를 표시한다", async () => {
    mockCreateBucketList.mockRejectedValue(new Error("저장에 실패했습니다."));
    const { container } = render(<CreateBucketListForm />);

    fillRequiredFields(container);
    fireEvent.click(screen.getByRole("button", { name: "작성하기" }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("저장에 실패했습니다."),
    );
  });
});
