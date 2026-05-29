import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { CirclePlusIcon } from "../app/(afterLogin)/_components/CirclePlusIcon";

const darkDecorator = (Story: React.ComponentType) => (
  <Story />
);

const meta = {
  title: "Components/CirclePlusIcon",
  component: CirclePlusIcon,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    circleColor: {
      control: "color",
      description: "원의 채우기 색상",
    },
    plusColor: {
      control: "color",
      description: "+ 아이콘의 색상",
    },
    size: {
      control: { type: "range", min: 24, max: 200, step: 4 },
      description: "아이콘 크기 (px)",
    },
  },
} satisfies Meta<typeof CirclePlusIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "기본",
  decorators: [darkDecorator],
};

export const Small: Story = {
  name: "소형 (48px)",
  args: { size: 48 },
  decorators: [darkDecorator],
};

export const Large: Story = {
  name: "대형 (128px)",
  args: { size: 128 },
  decorators: [darkDecorator],
};
