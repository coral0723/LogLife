import type { ComponentProps } from "react";

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { AvatarEditPanel } from "../AvatarEditPanel";
import { AVATAR_PATHS } from "@/lib/avatar";

function renderPanel(props?: Partial<ComponentProps<typeof AvatarEditPanel>>) {
  const defaultProps: ComponentProps<typeof AvatarEditPanel> = {
    avatars: AVATAR_PATHS,
    selectedAvatar: AVATAR_PATHS[0],
    currentAvatar: AVATAR_PATHS[0],
    isPending: false,
    onSelect: vi.fn(),
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };
  return render(<AvatarEditPanel {...defaultProps} {...props} />);
}

describe("AvatarEditPanel", () => {
  it("AVATAR_PATHS 개수만큼 아바타 이미지를 렌더링한다", () => {
    const { container } = renderPanel();

    expect(container.querySelectorAll("img")).toHaveLength(AVATAR_PATHS.length);
  });

  it("selectedAvatar === currentAvatar이면 해당 아바타에 체크 배지가 표시되고 변경하기 버튼이 비활성화된다", () => {
    const { container } = renderPanel();

    const selectedButton = container.querySelector(`img[src="${AVATAR_PATHS[0]}"]`)!.closest("button")!;
    expect(selectedButton.querySelector(".bg-green-500")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "변경하기" })).toBeDisabled();
  });

  it("다른 아바타 클릭 시 onSelect가 클릭한 path로 호출된다", () => {
    const onSelect = vi.fn();
    const { container } = renderPanel({ onSelect });

    const targetButton = container.querySelector(`img[src="${AVATAR_PATHS[1]}"]`)!.closest("button")!;
    fireEvent.click(targetButton);

    expect(onSelect).toHaveBeenCalledWith(AVATAR_PATHS[1]);
  });

  it("selectedAvatar !== currentAvatar이면 변경하기 버튼이 활성화된다", () => {
    renderPanel({ selectedAvatar: AVATAR_PATHS[1], currentAvatar: AVATAR_PATHS[0] });

    const confirmButton = screen.getByRole("button", { name: "변경하기" });
    expect(confirmButton).toBeEnabled();
    expect(confirmButton).toHaveClass("bg-[#2cc2f7]");
  });

  it("활성화된 변경하기 버튼 클릭 시 onConfirm이 호출된다", () => {
    const onConfirm = vi.fn();
    renderPanel({ selectedAvatar: AVATAR_PATHS[1], currentAvatar: AVATAR_PATHS[0], onConfirm });

    fireEvent.click(screen.getByRole("button", { name: "변경하기" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("isPending이면 변경하기 버튼이 비활성화되고 '변경 중'과 로딩 스피너가 표시된다", () => {
    renderPanel({ selectedAvatar: AVATAR_PATHS[1], currentAvatar: AVATAR_PATHS[0], isPending: true });

    expect(screen.getByRole("button", { name: /변경 중/ })).toBeDisabled();
    expect(screen.getByRole("status", { name: "로딩 중" })).toBeInTheDocument();
  });

  it("취소 클릭 시 onCancel이 호출된다", () => {
    const onCancel = vi.fn();
    renderPanel({ onCancel });

    fireEvent.click(screen.getByRole("button", { name: "취소" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
