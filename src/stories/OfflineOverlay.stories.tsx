import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import OfflineOverlay from '@/components/ui/OfflineOverlay';

const meta = {
  title: 'Components/OfflineOverlay',
  component: OfflineOverlay,
  parameters: {
    layout: 'fullscreen',
    // fixed inset-0 컴포넌트는 flow 크기가 없어 docs iframe이 collapse됨 — 명시적 높이 지정
    docs: { story: { height: '400px' } },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof OfflineOverlay>;

export default meta;
type Story = StoryObj<typeof meta>;

// 데코레이터에서 navigator.onLine을 false로 고정 → useEffect가 마운트 시 isOffline=true로 설정
export const Offline: Story = {
  decorators: [
    (Story) => {
      Object.defineProperty(navigator, 'onLine', {
        get: () => false,
        configurable: true,
      });
      return <Story />;
    },
  ],
  parameters: {
    docs: {
      description: {
        story:
          '인터넷 연결이 끊어진 상태. 전체 화면을 덮는 반투명 오버레이와 안내 메시지가 표시됩니다.',
      },
    },
  },
};

// 온라인 상태에서는 null을 반환해 아무것도 렌더링하지 않음
export const Online: Story = {
  decorators: [
    (Story) => {
      Object.defineProperty(navigator, 'onLine', {
        get: () => true,
        configurable: true,
      });
      return <Story />;
    },
  ],
  parameters: {
    docs: {
      description: {
        story: '온라인 상태. 컴포넌트는 null을 반환해 아무것도 표시하지 않습니다.',
      },
    },
  },
};
