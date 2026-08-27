import { ReactNode } from "react";
import { useTheme } from "../contexts/ThemeContext";

export default function ScrollableTableCard({
  children,
  footer,
}: {
  children: ReactNode;
  footer?: ReactNode;
}) {
  const { t } = useTheme();

  return (
    <div
      className={`${t.card} flex flex-col flex-1 min-h-0 overflow-hidden p-0!`}
    >
      <div className="overflow-y-auto overflow-x-auto flex-1 custom-scrollbar relative">
        {children}
      </div>
      {footer && (
        <div className="p-3 border-t border-(--border-color) flex items-center justify-between bg-(--bg-card) shrink-0">
          {footer}
        </div>
      )}
    </div>
  );
}
