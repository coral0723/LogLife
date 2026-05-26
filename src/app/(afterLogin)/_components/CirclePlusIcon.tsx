interface Props {
  circleColor?: string;
  plusColor?: string;
  size?: number;
  className?: string;
}

export function CirclePlusIcon({
  circleColor = "#f3f4f6",
  plusColor = "#060d1f",
  size = 80,
  className,
}: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
    >
      <circle cx="50" cy="50" r="46" fill={circleColor} />
      <line
        x1="50"
        y1="27"
        x2="50"
        y2="73"
        stroke={plusColor}
        strokeWidth="10"
        strokeLinecap="round"
      />
      <line
        x1="27"
        y1="50"
        x2="73"
        y2="50"
        stroke={plusColor}
        strokeWidth="10"
        strokeLinecap="round"
      />
    </svg>
  );
}
