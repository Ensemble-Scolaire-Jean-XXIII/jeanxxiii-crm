"use client";

import { useState } from "react";
import Image from "next/image";
import { useTheme } from "../contexts/ThemeContext";

export default function RefreshButton({
  onRefresh,
}: {
  onRefresh: () => Promise<void> | void;
}) {
  const { t } = useTheme();
  const [isRotating, setIsRotating] = useState(false);

  const handleClick = async () => {
    setIsRotating(true);
    await onRefresh();
    setTimeout(() => setIsRotating(false), 500);
  };

  return (
    <button
      onClick={handleClick}
      className={
        t.btnGhost + " p-2.5 flex items-center justify-center cursor-pointer"
      }
      title="Actualiser"
    >
      <Image
        src="/icons/refresh.webp"
        alt="Actualiser"
        width={16}
        height={16}
        className={`object-contain brightness-0 invert shrink-0 transition-transform duration-500 ${
          isRotating ? "rotate-360" : ""
        }`}
        unoptimized
      />
    </button>
  );
}
