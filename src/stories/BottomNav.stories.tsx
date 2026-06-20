import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Bell, Gear, House, Globe, PencilSimple, SquaresFour } from "@phosphor-icons/react";

import { BottomNav, type NavItem } from "@/components/nav/BottomNav";

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

function CustomItemsDemo() {
  const [activeLabel, setActiveLabel] = useState<string | null>("알림");

  const items: NavItem[] = [
    {
      icon: House,
      label: "홈",
      onClick: () => setActiveLabel((prev) => (prev === "홈" ? null : "홈")),
      active: activeLabel === "홈",
    },
    {
      icon: Bell,
      label: "알림",
      onClick: () => setActiveLabel((prev) => (prev === "알림" ? null : "알림")),
      active: activeLabel === "알림",
    },
    {
      icon: Gear,
      label: "설정",
      onClick: () => setActiveLabel((prev) => (prev === "설정" ? null : "설정")),
      active: activeLabel === "설정",
    },
  ];

  return <BottomNav items={items} />;
}

export const CustomItems: Story = {
  name: "커스텀 아이템",
  render: () => <CustomItemsDemo />,
};
