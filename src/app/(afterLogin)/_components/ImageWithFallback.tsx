"use client";

import { useState } from "react";
import { Camera } from "@phosphor-icons/react";

interface Props {
  src: string;
  alt?: string;
  containerClassName: string;
  iconSize: number;
  iconClassName: string;
}

export function ImageWithFallback({
  src,
  alt = "",
  containerClassName,
  iconSize,
  iconClassName,
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
          className="w-full h-full object-cover"
          onError={() => setError(true)}
        />
      )}
    </div>
  );
}
