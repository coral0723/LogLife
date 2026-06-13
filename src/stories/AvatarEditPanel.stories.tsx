import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { AvatarEditPanel } from "../app/(afterLogin)/profile/_components/AvatarEditPanel";
import { AVATAR_PATHS } from "../lib/avatar";

const meta = {
  title: "Components/AvatarEditPanel",
  component: AvatarEditPanel,
  parameters: {
    layout: "centered",
  },
  args: {
    avatars: AVATAR_PATHS,
    onSelect: () => {},
    onConfirm: () => {},
    onCancel: () => {},
  },
  argTypes: {
    onSelect: { control: false },
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
} satisfies Meta<typeof AvatarEditPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "기본",
  args: {
    selectedAvatar: AVATAR_PATHS[0],
    currentAvatar: AVATAR_PATHS[0],
    isPending: false,
  },
};

export const AvatarSelected: Story = {
  name: "아바타 선택됨",
  args: {
    selectedAvatar: AVATAR_PATHS[3],
    currentAvatar: AVATAR_PATHS[0],
    isPending: false,
  },
};

export const Pending: Story = {
  name: "변경 중",
  args: {
    selectedAvatar: AVATAR_PATHS[3],
    currentAvatar: AVATAR_PATHS[0],
    isPending: true,
  },
};
