import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import LoadingSpinner from '../app/(afterLogin)/_components/LoadingSpinner';

const meta = {
  title: 'Components/LoadingSpinner',
  component: LoadingSpinner,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
      description: '스피너 크기 (px: xs=24, sm=32, md=48, lg=64)',
    },
  },
  args: {
    size: 'md',
  },
} satisfies Meta<typeof LoadingSpinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ExtraSmall: Story = {
  args: { size: 'xs' },
};

export const Small: Story = {
  args: { size: 'sm' },
};

export const Medium: Story = {
  args: { size: 'md' },
};

export const Large: Story = {
  args: { size: 'lg' },
};
