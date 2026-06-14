import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fireEvent, fn, userEvent, waitFor, within } from "storybook/test";

import { CreateBucketListForm } from "../app/(afterLogin)/create/_components/CreateBucketListForm";
import { placesHandlers } from "../mocks/handlers/places";

const meta = {
  title: "Components/CreateBucketListForm",
  component: CreateBucketListForm,
  parameters: {
    layout: "fullscreen",
    nextjs: { appDirectory: true },
    msw: { handlers: placesHandlers },
  },
  decorators: [
    (Story) => (
      <div
        style={{
          maxWidth: "448px",
          height: "85vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          border: "1px solid #e4e4e7",
          borderRadius: "1.5rem",
          margin: "1rem auto",
          background: "#fff",
        }}
      >
        <div className="flex-shrink-0 px-5 pt-6 pb-6">
          <h2 className="text-lg font-semibold text-zinc-900">버킷리스트 작성</h2>
        </div>
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
  args: {
    onSuccess: fn(),
  },
  argTypes: {
    onSuccess: {
      control: false,
      description:
        "제출 성공 시 호출되는 콜백. 미전달 시 `/main`으로 이동 — 패널 안에서는 패널 닫기·데이터 갱신 목적으로 전달.",
    },
  },
} satisfies Meta<typeof CreateBucketListForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "기본",
};

export const Filled: Story = {
  name: "필수값 입력 완료",
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const titleInput = canvasElement.querySelector<HTMLInputElement>('input[name="title"]')!;
    await userEvent.type(titleInput, "도쿄 여행");

    // 위치 select(role=combobox)와 구분하기 위해 PlacesAutocomplete input을 직접 선택
    const placeInput = canvasElement.querySelector<HTMLInputElement>('input[role="combobox"]')!;
    await userEvent.type(placeInput, "도쿄");
    const listbox = await canvas.findByRole("listbox");
    await userEvent.click(within(listbox).getAllByRole("option")[0]);

    const deadlineInput = canvasElement.querySelector<HTMLInputElement>(
      'input[name="deadlineAt"]',
    )!;
    fireEvent.change(deadlineInput, { target: { value: "2026-12-31" } });

    const submitButton = canvas.getByRole("button", { name: "작성하기" });
    await waitFor(() => expect(submitButton).toBeEnabled());

    await userEvent.click(submitButton);

    await waitFor(() => expect(args.onSuccess).toHaveBeenCalled());
  },
};
