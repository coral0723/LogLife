import type { ComponentProps } from "react";

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { NicknameEditPanel } from "../NicknameEditPanel";

function renderPanel(props?: Partial<ComponentProps<typeof NicknameEditPanel>>) {
  const defaultProps: ComponentProps<typeof NicknameEditPanel> = {
    value: "홍길동",
    currentNickname: "홍길동",
    isPending: false,
    errorMessage: null,
    onChange: vi.fn(),
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };
  return render(<NicknameEditPanel {...defaultProps} {...props} />);
}

describe("NicknameEditPanel", () => {
  it("input에 초기값(value)이 표시된다", () => {
    renderPanel({ value: "홍길동" });

    expect(screen.getByRole("textbox")).toHaveValue("홍길동");
  });

  it("글자수 카운터를 value.length/15 형식으로 표시한다", () => {
    renderPanel({ value: "홍길동" });

    expect(screen.getByText("3/15")).toBeInTheDocument();
  });

  it("input에 maxLength=15 속성이 있다", () => {
    renderPanel();

    expect(screen.getByRole("textbox")).toHaveAttribute("maxLength", "15");
  });

  it("value === currentNickname이면(변경 없음) 변경하기 버튼이 비활성화된다", () => {
    renderPanel({ value: "홍길동", currentNickname: "홍길동" });

    expect(screen.getByRole("button", { name: "변경하기" })).toBeDisabled();
  });

  it("input에 타이핑하면 onChange가 입력값으로 호출된다", () => {
    const onChange = vi.fn();
    renderPanel({ onChange });

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "새닉네임" } });

    expect(onChange).toHaveBeenCalledWith("새닉네임");
  });

  it("value !== currentNickname이고 비어있지 않으면 변경하기 버튼이 활성화된다", () => {
    renderPanel({ value: "새닉네임", currentNickname: "홍길동" });

    const confirmButton = screen.getByRole("button", { name: "변경하기" });
    expect(confirmButton).toBeEnabled();
    expect(confirmButton).toHaveClass("bg-[#2cc2f7]");
  });

  it("value가 빈 문자열이면 변경하기 버튼이 비활성화된다", () => {
    renderPanel({ value: "", currentNickname: "홍길동" });

    expect(screen.getByRole("button", { name: "변경하기" })).toBeDisabled();
  });

  it("value가 공백만이면 변경하기 버튼이 비활성화된다", () => {
    renderPanel({ value: "   ", currentNickname: "홍길동" });

    expect(screen.getByRole("button", { name: "변경하기" })).toBeDisabled();
  });

  it("활성화된 변경하기 버튼 클릭 시 onConfirm이 호출된다", () => {
    const onConfirm = vi.fn();
    renderPanel({ value: "새닉네임", currentNickname: "홍길동", onConfirm });

    fireEvent.click(screen.getByRole("button", { name: "변경하기" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("isPending이면 변경하기 버튼이 비활성화되고 '변경 중'과 로딩 스피너가 표시된다", () => {
    renderPanel({ value: "새닉네임", currentNickname: "홍길동", isPending: true });

    expect(screen.getByRole("button", { name: /변경 중/ })).toBeDisabled();
    expect(screen.getByRole("status", { name: "로딩 중" })).toBeInTheDocument();
  });

  it("errorMessage가 문자열이면 해당 텍스트가 표시된다", () => {
    renderPanel({ errorMessage: "이미 존재하는 닉네임입니다." });

    expect(screen.getByText("이미 존재하는 닉네임입니다.")).toBeInTheDocument();
  });

  it("errorMessage가 null이면 토스트 영역이 표시되지 않는다", () => {
    const { container } = renderPanel({ errorMessage: null });

    expect(container.querySelector(".absolute.inset-x-4")).not.toBeInTheDocument();
  });

  it("취소 클릭 시 onCancel이 호출된다", () => {
    const onCancel = vi.fn();
    renderPanel({ onCancel });

    fireEvent.click(screen.getByRole("button", { name: "취소" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
