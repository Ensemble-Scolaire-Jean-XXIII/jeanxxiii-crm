"use client";

import { SortHeaderProps } from "../types";
import { useTheme } from "../contexts/ThemeContext";

export default function SortHeader({
  field,
  label,
  sortField,
  sortDirection,
  onSort,
  className = "",
}: SortHeaderProps & { className?: string }) {
  const { t } = useTheme();

  return (
    <th
      className={`sticky top-0 z-20 px-3 py-3 font-semibold cursor-pointer hover:opacity-70 select-none ${t.tableHeader} ${className}`}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-2">
        <span>{label}</span>
        <span
          className={`text-[10px] ${
            sortField === field ? "opacity-100" : "opacity-30"
          }`}
        >
          {sortField === field ? (sortDirection === "asc" ? "▲" : "▼") : "↕"}
        </span>
      </div>
    </th>
  );
}
