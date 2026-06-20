"use client";

type Props = {
  name: string;
  value: number;
  onChange: (value: number) => void;
  max?: number;
  dotClassName?: string;
};

export function DotRatingInput({ name, value, onChange, max = 5, dotClassName }: Props) {
  return (
    <div role="radiogroup" className="flex items-center gap-2.5">
      <input type="hidden" name={name} value={value} />
      {Array.from({ length: max }, (_, i) => i + 1).map((score) => (
        <button
          key={score}
          type="button"
          role="radio"
          aria-checked={score === value}
          aria-label={`${score}점`}
          onClick={() => onChange(score)}
          className={`h-6 w-6 rounded-full transition-colors cursor-pointer ${
            score <= value ? "bg-[#2cc2f7]" : (dotClassName ?? "bg-zinc-200 hover:bg-zinc-300")
          }`}
        />
      ))}
    </div>
  );
}
