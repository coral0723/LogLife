import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { AvatarStep } from "../AvatarStep";

vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element -- next/image 자체를 목킹하는 용도
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

const { mockUpdateAvatar } = vi.hoisted(() => ({
  mockUpdateAvatar: vi.fn(),
}));

vi.mock("@/actions/onboarding/actions", () => ({
  updateAvatar: mockUpdateAvatar,
}));

describe("AvatarStep", () => {
  const onNext = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("10개 아바타 버튼이 렌더링된다", () => {
    render(<AvatarStep onNext={onNext} />);
    const avatarButtons = screen
      .getAllByRole("button")
      .filter((btn) => btn.hasAttribute("aria-pressed"));
    expect(avatarButtons).toHaveLength(10);
  });

  it("아바타 선택 전 '다음으로' 버튼이 비활성화된다", () => {
    render(<AvatarStep onNext={onNext} />);
    expect(screen.getByRole("button", { name: "다음으로" })).toBeDisabled();
  });

  it("아바타 선택 전 안내 문구가 표시된다", () => {
    render(<AvatarStep onNext={onNext} />);
    expect(
      screen.getByText("아바타를 선택하면 다음 단계로 진행할 수 있어요")
    ).toBeInTheDocument();
  });

  it("아바타 클릭 시 aria-pressed가 true가 된다", () => {
    render(<AvatarStep onNext={onNext} />);
    const btn = screen.getByRole("button", { name: "우주인" });

    fireEvent.click(btn);

    expect(btn).toHaveAttribute("aria-pressed", "true");
  });

  it("아바타 선택 후 '다음으로' 버튼이 활성화된다", () => {
    render(<AvatarStep onNext={onNext} />);

    fireEvent.click(screen.getByRole("button", { name: "우주인" }));

    expect(screen.getByRole("button", { name: "다음으로" })).toBeEnabled();
  });

  it("'다음으로' 클릭 시 updateAvatar를 선택한 경로로 호출한다", async () => {
    mockUpdateAvatar.mockResolvedValue(undefined);
    render(<AvatarStep onNext={onNext} />);

    fireEvent.click(screen.getByRole("button", { name: "우주인" }));
    fireEvent.click(screen.getByRole("button", { name: "다음으로" }));

    await waitFor(() =>
      expect(mockUpdateAvatar).toHaveBeenCalledWith("/avatars/astronaut.png")
    );
  });

  it("updateAvatar 성공 시 onNext가 호출된다", async () => {
    mockUpdateAvatar.mockResolvedValue(undefined);
    render(<AvatarStep onNext={onNext} />);

    fireEvent.click(screen.getByRole("button", { name: "우주인" }));
    fireEvent.click(screen.getByRole("button", { name: "다음으로" }));

    await waitFor(() => expect(onNext).toHaveBeenCalledTimes(1));
  });

  it("updateAvatar 실패 시 에러 메시지를 표시하고 onNext는 호출하지 않는다", async () => {
    mockUpdateAvatar.mockRejectedValue(new Error("실패"));
    render(<AvatarStep onNext={onNext} />);

    fireEvent.click(screen.getByRole("button", { name: "우주인" }));
    fireEvent.click(screen.getByRole("button", { name: "다음으로" }));

    await waitFor(() =>
      expect(
        screen.getByText("아바타 저장에 실패했어요. 다시 시도해주세요.")
      ).toBeInTheDocument()
    );
    expect(onNext).not.toHaveBeenCalled();
  });
});
