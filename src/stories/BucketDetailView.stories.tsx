import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { BucketDetailView } from "../app/(afterLogin)/main/_components/BucketDetailView";
import type { BucketDetail } from "../api/bucketlists";

const BASE: BucketDetail = {
  id: "1",
  title: "도쿄 라멘 골목 탐방",
  description:
    "신주쿠 골든가이 근처 숨겨진 라멘집 5곳을 방문하고 최고의 라멘을 찾아본다.",
  visibility: "PUBLIC",
  deadlineAt: null,
  achievedAt: null,
  difficulty: 3,
  excitement: 5,
  achieved: false,
  placeId: "ChIJ1111",
  displayName: "신주쿠구",
  countryCode: "JP",
  shareToken: "abc123",
};

const meta = {
  title: "Components/BucketDetailView",
  component: BucketDetailView,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story: React.ComponentType) => (
      <div
        style={{
          maxWidth: "448px",
          height: "85vh",
          overflow: "hidden",
          border: "1px solid #e4e4e7",
          borderRadius: "1.5rem",
          margin: "1rem auto",
        }}
      >
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
  args: {
    detail: BASE,
    onBack: () => {},
    photoSrc: "/stories/ramen-demo.jpg",
  },
  argTypes: {
    detail: {
      control: false,
      description:
        "버킷리스트 상세 데이터 (id, title, description, visibility, deadlineAt, achievedAt, difficulty, excitement, achieved, placeId, displayName, countryCode, shareToken)",
    },
    photoSrc: {
      control: false,
      description:
        "커스텀 사진 URL. 미전달 시 `/api/places/photo?placeId=` 로 자동 요청.",
    },
    onBack: {
      control: false,
      description:
        "뒤로가기 버튼 클릭 시 호출되는 콜백. 미전달 시 버튼이 숨겨진다.",
    },
  },
} satisfies Meta<typeof BucketDetailView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "기본",
};

export const Achieved: Story = {
  name: "달성",
  args: {
    detail: {
      ...BASE,
      achieved: true,
      achievedAt: "2024-12-25T00:00:00Z",
      deadlineAt: null,
    },
  },
};

export const WithDeadline: Story = {
  name: "마감일 있음",
  args: {
    detail: { ...BASE, deadlineAt: "2027-12-31T00:00:00Z" },
  },
};

export const Expired: Story = {
  name: "마감 초과",
  args: {
    detail: { ...BASE, deadlineAt: "2024-01-01T00:00:00Z" },
  },
};

export const Private: Story = {
  name: "비공개",
  args: {
    detail: { ...BASE, visibility: "PRIVATE" },
  },
};
