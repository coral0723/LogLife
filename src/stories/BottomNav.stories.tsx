import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Bell, Gear, House } from "@phosphor-icons/react";

import { BottomNav } from "../app/(afterLogin)/_components/BottomNav";

const meta = {
  title: "Components/BottomNav",
  component: BottomNav,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div style={{ height: "300px", background: "#f3f4f6" }}>
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
  argTypes: {
    items: {
      control: false,
      description: `네비게이션 아이템 목록. 미전달 시 앱 기본 메뉴(프로필·메인·친구) 사용.`,
    },
  },
} satisfies Meta<typeof BottomNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "기본",
  parameters: {
    nextjs: { navigation: { pathname: "/" } },
  },
};

export const CustomItems: Story = {
  name: "커스텀 아이템",
  args: {
    items: [
      { href: "/home", icon: House, label: "홈" },
      { href: "/notifications", icon: Bell, label: "알림" },
      { href: "/settings", icon: Gear, label: "설정" },
    ],
  },
  parameters: {
    nextjs: { navigation: { pathname: "/notifications" } },
  },
};
