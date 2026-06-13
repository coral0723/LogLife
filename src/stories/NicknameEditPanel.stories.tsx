import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { NicknameEditPanel } from "../app/(afterLogin)/profile/_components/NicknameEditPanel";

const meta = {
  title: "Components/NicknameEditPanel",
  component: NicknameEditPanel,
  parameters: {
    layout: "centered",
  },
  args: {
    onChange: () => {},
    onConfirm: () => {},
    onCancel: () => {},
  },
  argTypes: {
    onChange: { control: false },
    onConfirm: { control: false },
    onCancel: { control: false },
  },
  decorators: [
    (Story) => (
      <div style={{ width: "360px", display: "flex", flexDirection: "column", padding: "0 24px" }}>
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
} satisfies Meta<typeof NicknameEditPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "기본",
  args: {
    value: "홍길동",
    currentNickname: "홍길동",
    isPending: false,
    errorMessage: null,
  },
};

export const Changed: Story = {
  name: "변경됨",
  args: {
    value: "새닉네임",
    currentNickname: "홍길동",
    isPending: false,
    errorMessage: null,
  },
};

export const Pending: Story = {
  name: "변경 중",
  args: {
    value: "새닉네임",
    currentNickname: "홍길동",
    isPending: true,
    errorMessage: null,
  },
};

export const DuplicateError: Story = {
  name: "중복 닉네임 에러",
  args: {
    value: "중복닉네임",
    currentNickname: "홍길동",
    isPending: false,
    errorMessage: "이미 존재하는 닉네임입니다.",
  },
};
