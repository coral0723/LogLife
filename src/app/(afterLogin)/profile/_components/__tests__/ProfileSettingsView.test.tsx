import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ProfileSettingsView } from "../ProfileSettingsView";
import { fetchCurrentUser } from "@/api/user";
import { updateAvatar, updateNickname } from "@/actions/user/actions";
import { AVATAR_PATHS } from "@/lib/avatar";

vi.mock("@/api/user", () => ({
  fetchCurrentUser: vi.fn(),
  userQueryKeys: {
    me: () => ["user", "me"],
  },
}));

vi.mock("@/actions/user/actions", () => ({
  updateAvatar: vi.fn(),
  updateNickname: vi.fn(),
  deleteAccount: vi.fn(),
}));

const mockFetchCurrentUser = vi.mocked(fetchCurrentUser);
const mockUpdateAvatar = vi.mocked(updateAvatar);
const mockUpdateNickname = vi.mocked(updateNickname);

function renderView() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(<ProfileSettingsView />, { wrapper: Wrapper });
}

async function enterEditMode(container: HTMLElement) {
  fireEvent.click(await screen.findByRole("button", { name: "프로필 변경" }));
  return container;
}

async function enterNicknameEditMode() {
  const row = (await screen.findByText("닉네임")).closest("button")!;
  fireEvent.click(row);
}

describe("ProfileSettingsView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchCurrentUser.mockResolvedValue({
      image: AVATAR_PATHS[0],
      name: "홍길동",
      username: "honggildong",
    });
  });

  it("'프로필 변경' 클릭 시 닉네임/로그아웃 영역이 사라지고 아바타 그리드와 취소/변경하기 버튼이 표시된다", async () => {
    const { container } = renderView();

    await enterEditMode(container);

    expect(screen.queryByText("닉네임")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "로그아웃" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "탈퇴하기" })).not.toBeInTheDocument();
    expect(container.querySelectorAll("img")).toHaveLength(AVATAR_PATHS.length + 1);
    expect(screen.getByRole("button", { name: "취소" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "변경하기" })).toBeDisabled();
  });

  it("그리드에서 다른 아바타 클릭 시 상단 이미지의 src가 변경되고 변경하기 버튼이 활성화된다", async () => {
    const { container } = renderView();

    await enterEditMode(container);

    const targetButton = container.querySelector(`img[src="${AVATAR_PATHS[1]}"]`)!.closest("button")!;
    fireEvent.click(targetButton);

    expect(container.querySelector("img")!.src).toContain(AVATAR_PATHS[1]);
    expect(screen.getByRole("button", { name: "변경하기" })).toBeEnabled();
  });

  it("취소 클릭 시 기존 영역으로 복귀하고, 상단 이미지가 원래 아바타로 복원되며 updateAvatar는 호출되지 않는다", async () => {
    const { container } = renderView();

    await enterEditMode(container);

    const targetButton = container.querySelector(`img[src="${AVATAR_PATHS[1]}"]`)!.closest("button")!;
    fireEvent.click(targetButton);

    fireEvent.click(screen.getByRole("button", { name: "취소" }));

    expect(screen.getByText("닉네임")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "로그아웃" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "탈퇴하기" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "프로필 변경" })).toBeInTheDocument();
    expect(container.querySelector("img")!.src).toContain(AVATAR_PATHS[0]);
    expect(mockUpdateAvatar).not.toHaveBeenCalled();
  });

  it("아바타 선택 후 변경하기 클릭 시 updateAvatar가 호출되고, 완료 후 기존 영역으로 복귀하며 상단 이미지가 새 아바타로 유지된다", async () => {
    mockUpdateAvatar.mockResolvedValue({ image: AVATAR_PATHS[1] });
    const { container } = renderView();

    await enterEditMode(container);

    const targetButton = container.querySelector(`img[src="${AVATAR_PATHS[1]}"]`)!.closest("button")!;
    fireEvent.click(targetButton);

    fireEvent.click(screen.getByRole("button", { name: "변경하기" }));

    await waitFor(() => {
      expect(mockUpdateAvatar).toHaveBeenCalledWith(AVATAR_PATHS[1], expect.anything());
    });

    await waitFor(() => {
      expect(screen.getByText("닉네임")).toBeInTheDocument();
    });

    expect(container.querySelector("img")!.src).toContain(AVATAR_PATHS[1]);
  });

  it("updateAvatar가 pending인 동안 '변경 중'과 로딩 스피너가 표시된다", async () => {
    mockUpdateAvatar.mockImplementation(() => new Promise(() => {}));
    const { container } = renderView();

    await enterEditMode(container);

    const targetButton = container.querySelector(`img[src="${AVATAR_PATHS[1]}"]`)!.closest("button")!;
    fireEvent.click(targetButton);

    fireEvent.click(screen.getByRole("button", { name: "변경하기" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /변경 중/ })).toBeDisabled();
    });
    expect(screen.getByRole("status", { name: "로딩 중" })).toBeInTheDocument();
  });

  it("'닉네임' 행 클릭 시 프로필 변경/로그아웃/탈퇴하기 버튼이 사라지고 닉네임 입력 영역이 표시된다", async () => {
    renderView();

    await enterNicknameEditMode();

    expect(screen.queryByRole("button", { name: "프로필 변경" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "로그아웃" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "탈퇴하기" })).not.toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveValue("홍길동");
    expect(screen.getByText("3/15")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "취소" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "변경하기" })).toBeDisabled();
  });

  it("input 값을 변경하면 변경하기 버튼이 활성화된다", async () => {
    renderView();

    await enterNicknameEditMode();

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "새닉네임" } });

    expect(screen.getByRole("button", { name: "변경하기" })).toBeEnabled();
  });

  it("취소 클릭 시 기존 화면으로 복귀하고 updateNickname은 호출되지 않는다", async () => {
    renderView();

    await enterNicknameEditMode();

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "새닉네임" } });
    fireEvent.click(screen.getByRole("button", { name: "취소" }));

    expect(screen.getByRole("button", { name: "프로필 변경" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "로그아웃" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "탈퇴하기" })).toBeInTheDocument();
    expect(mockUpdateNickname).not.toHaveBeenCalled();
  });

  it("닉네임 변경 후 변경하기 클릭 시 updateNickname이 trim된 값으로 호출되고, 완료 후 기존 화면으로 복귀하며 새 닉네임이 표시된다", async () => {
    mockUpdateNickname.mockResolvedValue({ name: "새닉네임" });
    renderView();

    await enterNicknameEditMode();

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "  새닉네임  " } });
    fireEvent.click(screen.getByRole("button", { name: "변경하기" }));

    await waitFor(() => {
      expect(mockUpdateNickname).toHaveBeenCalledWith("새닉네임", expect.anything());
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "프로필 변경" })).toBeInTheDocument();
    });

    expect(screen.getByText("새닉네임")).toBeInTheDocument();
  });

  it("updateNickname이 중복 닉네임 에러로 reject되면 에러 메시지가 토스트로 표시되고 입력 화면을 유지한다", async () => {
    mockUpdateNickname.mockRejectedValue(new Error("이미 존재하는 닉네임입니다."));
    renderView();

    await enterNicknameEditMode();

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "중복닉네임" } });
    fireEvent.click(screen.getByRole("button", { name: "변경하기" }));

    await waitFor(() => {
      expect(screen.getByText("이미 존재하는 닉네임입니다.")).toBeInTheDocument();
    });

    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("updateNickname이 pending인 동안 '변경 중'과 로딩 스피너가 표시된다", async () => {
    mockUpdateNickname.mockImplementation(() => new Promise(() => {}));
    renderView();

    await enterNicknameEditMode();

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "새닉네임" } });
    fireEvent.click(screen.getByRole("button", { name: "변경하기" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /변경 중/ })).toBeDisabled();
    });
    expect(screen.getByRole("status", { name: "로딩 중" })).toBeInTheDocument();
  });
});
