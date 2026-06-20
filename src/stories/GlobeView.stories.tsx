import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { GlobeView } from "@/components/globe/GlobeView";

const meta = {
  title: "Components/GlobeView",
  component: GlobeView,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div style={{ height: "500px", background: "#000" }}>
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
  args: {
    onPinClick: () => {},
    onReady: () => {},
  },
  argTypes: {
    pins: {
      control: false,
      description: "지도 위에 표시할 핀 목록. 국가별 버킷리스트 등록 수·달성 수·마감 초과 여부를 포함.",
    },
    onPinClick: {
      description: "핀 클릭 시 호출되는 콜백. 클릭된 `CountryPin` 데이터를 인자로 전달.",
    },
    onReady: {
      description: "지구본 렌더링이 완료됐을 때 한 번 호출되는 콜백.",
    },
  },
} satisfies Meta<typeof GlobeView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithPins: Story = {
  name: "혼합 핀",
  args: {
    pins: [
      { countryCode: "KR", lat: 36, lng: 128, count: 3, achievedCount: 1, hasExpiredDeadline: false },
      { countryCode: "JP", lat: 36, lng: 138, count: 2, achievedCount: 2, hasExpiredDeadline: false },
      { countryCode: "FR", lat: 46, lng: 2, count: 1, achievedCount: 0, hasExpiredDeadline: true },
      { countryCode: "US", lat: 38, lng: -97, count: 5, achievedCount: 2, hasExpiredDeadline: false },
      { countryCode: "AU", lat: -25, lng: 133, count: 4, achievedCount: 4, hasExpiredDeadline: false },
    ],
  },
};

// JP: WithPins에서도 achieved → gradient ID 충돌 없이 골드 표시
export const Achieved: Story = {
  name: "전부 달성",
  args: {
    pins: [
      { countryCode: "JP", lat: 36, lng: 138, count: 2, achievedCount: 2, hasExpiredDeadline: false },
    ],
  },
};

// KR: WithPins에서도 pending → gradient ID 충돌 없이 회색 표시
export const Pending: Story = {
  name: "하나라도 미달성",
  args: {
    pins: [
      { countryCode: "KR", lat: 36, lng: 128, count: 3, achievedCount: 1, hasExpiredDeadline: false },
    ],
  },
};

// TW: WithPins에 없는 국가 코드 → gradient ID 신규 등록, 빨간 핀 표시
export const Expired: Story = {
  name: "하나라도 마감 초과",
  args: {
    pins: [
      { countryCode: "TW", lat: 23.7, lng: 121, count: 2, achievedCount: 0, hasExpiredDeadline: true },
    ],
  },
};
