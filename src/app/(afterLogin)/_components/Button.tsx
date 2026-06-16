type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "cancel" | "danger";
  shape?: "rounded" | "pill";
};

const VARIANT_CLASSES = {
  primary: "bg-[#2cc2f7] hover:bg-[#1aade0] text-white",
  cancel: "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50",
  danger: "bg-red-500 hover:bg-red-600 text-white",
};

export function Button({
  variant = "primary",
  shape = "rounded",
  className = "",
  disabled,
  children,
  ...props
}: ButtonProps) {
  const shapeClass = shape === "pill" ? "rounded-full" : "rounded-xl";
  const colorClass = disabled
    ? "bg-zinc-300 text-white cursor-not-allowed"
    : `${VARIANT_CLASSES[variant]} cursor-pointer`;

  return (
    <button
      disabled={disabled}
      className={`${shapeClass} ${colorClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
