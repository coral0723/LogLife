"use client"

type Size = 'xs' | 'sm' | 'md' | 'lg';

type Props = {
  size?: Size;
};

export default function LoadingSpinner({ size = "md" }: Props) {
  const sizeMap: Record<Size, number> = {
    xs: 24,
    sm: 32,
    md: 48,
    lg: 64,
  };

  const px = sizeMap[size];

  return (
    <div className="flex items-center justify-center">
      <div
        role="status"
        aria-label="로딩 중"
        className="animate-spin rounded-full border-[4px] border-gray-400/20 border-t-gray-400"
        style={{ width: px, height: px }}
      />
    </div>
  );
}
