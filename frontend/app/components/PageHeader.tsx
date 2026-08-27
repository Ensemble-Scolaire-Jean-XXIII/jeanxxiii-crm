import React from "react";
import { useTheme } from "../contexts/ThemeContext";
import { PageHeaderProps } from "../types";

export default function PageHeader({
  title,
  description,
  children,
}: PageHeaderProps) {
  const { t } = useTheme();

  return (
    <div className="shrink-0 flex justify-between items-start sm:items-center flex-col sm:flex-row gap-4">
      <div>
        <h1 className={`${t.title} tracking-tight drop-shadow-md`}>{title}</h1>
        <p className={`${t.textMuted} mt-1 text-sm`}>{description}</p>
      </div>
      {children && <div className="flex gap-2">{children}</div>}
    </div>
  );
}
