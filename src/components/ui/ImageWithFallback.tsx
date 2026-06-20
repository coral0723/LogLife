"use client";

import { useState } from "react";
import { Camera } from "@phosphor-icons/react";

type Props = {
  src: string;
  alt?: string;
  containerClassName: string;
  iconSize: number;
  iconClassName: string;
  objectFit?: "cover" | "contain";
};

export function ImageWithFallback({
  src,
  alt = "",
  containerClassName,
  iconSize,
  iconClassName,
  objectFit = "cover",
}: Props) {
  const [error, setError] = useState(false);

  return (
    <div className={containerClassName}>
      {error ? (
        <Camera size={iconSize} className={iconClassName} weight="regular" />
      ) : (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full ${objectFit === "contain" ? "object-contain" : "object-cover"}`}
          onError={() => setError(true)}
        />
      )}
    </div>
  );
}
