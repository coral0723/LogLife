import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Bell, Gear, House, Globe, PencilSimple, SquaresFour } from "@phosphor-icons/react";

import { BottomNav, type NavItem } from "../app/(afterLogin)/_components/BottomNav";

const meta = {
  title: "Components/BottomNav",
  component: BottomNav,
  parameters: {
    layout: "fullscreen",
    nextjs: { appDirectory: true },
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
      description: `네비게이션 아이템 목록. 미전달 시 앱 기본 메뉴(대시보드·메인·친구) 사용.`,
    },
  },
} satisfies Meta<typeof BottomNav>;

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 메뉴(대시보드·메인·작성)와 동일한 아이콘 구성이지만, 클릭 시 패널을 열지 않고
// 클릭한 아이콘만 활성 상태로 표시되는 데모 컴포넌트
function BottomNavDemo() {
  const [activeLabel, setActiveLabel] = useState<string | null>(null);

  const items: NavItem[] = [
    {
      icon: SquaresFour,
      label: "대시보드",
      onClick: () => setActiveLabel((prev) => (prev === "대시보드" ? null : "대시보드")),
      active: activeLabel === "대시보드",
    },
    {
      icon: Globe,
      label: "메인",
      onClick: () => setActiveLabel((prev) => (prev === "메인" ? null : "메인")),
      active: activeLabel === "메인",
    },
    {
      icon: PencilSimple,
      label: "작성",
      onClick: () => setActiveLabel((prev) => (prev === "작성" ? null : "작성")),
      active: activeLabel === "작성",
    },
  ];

  return <BottomNav items={items} />;
}

export const Default: Story = {
  name: "기본",
  render: () => <BottomNavDemo />,
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
