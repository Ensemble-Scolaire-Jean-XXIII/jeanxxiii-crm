import React from "react";

interface ScrollableTableCardProps {
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function ScrollableTableCard({
  children,
  footer,
}: ScrollableTableCardProps) {
  return (
    <div className="glass-card p-3 flex flex-col flex-1 min-h-62.5 overflow-hidden">
      <div className="overflow-y-auto overflow-x-auto flex-1 rounded-t-lg custom-scrollbar pr-4">
        {children}
      </div>
      {footer && (
        <div className="flex justify-between items-center pt-3 mt-3 border-t border-white/10 shrink-0">
          {footer}
        </div>
      )}
    </div>
  );
}
