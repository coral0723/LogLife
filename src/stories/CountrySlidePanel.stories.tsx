import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { CountrySlidePanel } from "@/components/globe/CountrySlidePanel";
import { bucketlistHandlers } from "../mocks/handlers/bucketlists";

const queryClient = new QueryClient();

const meta = {
  title: "Components/CountrySlidePanel",
  component: CountrySlidePanel,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  args: {
    countryCode: null,
    onClose: () => {},
  },
  argTypes: {
    countryCode: {
      control: false,
      description:
        "표시할 국가 코드 (ISO 3166-1 alpha-2). `null`이면 패널이 닫힌다.",
    },
    onClose: {
      control: false,
      description: "닫기 버튼 또는 배경 클릭 시 호출되는 콜백.",
    },
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
} satisfies Meta<typeof CountrySlidePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

function PanelToggle({ countryCode }: { countryCode: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#0f172a",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            padding: "0.625rem 1.25rem",
            borderRadius: "0.5rem",
            background: "#3b82f6",
            color: "#fff",
            fontSize: "0.875rem",
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
          }}
        >
          패널 열기 · {countryCode}
        </button>
      )}
      <CountrySlidePanel
        countryCode={open ? countryCode : null}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}

export const Default: Story = {
  name: "기본",
  render: () => <PanelToggle countryCode="JP" />,
  parameters: {
    msw: { handlers: bucketlistHandlers },
  },
};

export const Empty: Story = {
  name: "빈 목록",
  render: () => <PanelToggle countryCode="KR" />,
  parameters: {
    msw: { handlers: bucketlistHandlers },
  },
};
