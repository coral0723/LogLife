import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { OnboardingClient } from "../OnboardingClient";

vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, className }: React.ComponentProps<"div">) => (
      <div className={className}>{children}</div>
    ),
  },
}));

vi.mock("@/components/globe/StarField", () => ({
  StarField: () => null,
}));

vi.mock("../AvatarStep", () => ({
  AvatarStep: ({ onNext }: { onNext: () => void }) => (
    <div>
      <span>아바타 스텝</span>
      <button type="button" onClick={onNext}>
        아바타 다음으로
      </button>
    </div>
  ),
}));

vi.mock("../FirstBucketStep", () => ({
  FirstBucketStep: () => <div>버킷리스트 스텝</div>,
}));

describe("OnboardingClient", () => {
  it("초기 렌더링 시 AvatarStep이 표시된다", () => {
    render(<OnboardingClient />);

    expect(screen.getByText("아바타 스텝")).toBeInTheDocument();
    expect(screen.queryByText("버킷리스트 스텝")).not.toBeInTheDocument();
  });

  it("StepProgress에 AVATAR·BUCKET 두 레이블이 표시된다", () => {
    render(<OnboardingClient />);

    expect(screen.getByText("AVATAR")).toBeInTheDocument();
    expect(screen.getByText("BUCKET")).toBeInTheDocument();
  });

  it("AvatarStep의 onNext 트리거 시 FirstBucketStep으로 전환된다", () => {
    render(<OnboardingClient />);

    fireEvent.click(screen.getByRole("button", { name: "아바타 다음으로" }));

    expect(screen.queryByText("아바타 스텝")).not.toBeInTheDocument();
    expect(screen.getByText("버킷리스트 스텝")).toBeInTheDocument();
  });

  it("두 번째 스텝 전환 후 스텝 번호 1·2 모두 활성 상태가 된다", () => {
    const { container } = render(<OnboardingClient />);

    fireEvent.click(screen.getByRole("button", { name: "아바타 다음으로" }));

    // 스텝 번호 2개 + 스텝 간 연결 바 1개 = 3개가 활성 색상을 가짐
    const activeElements = container.querySelectorAll(".bg-\\[\\#2cc2f7\\]");
    expect(activeElements).toHaveLength(3);
  });
});
