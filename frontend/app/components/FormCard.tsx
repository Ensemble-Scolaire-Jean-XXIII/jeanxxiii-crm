import React from "react";

interface FormCardProps {
  title: string;
  badge?: string;
  children: React.ReactNode;
}

export default function FormCard({
  title,
  badge = "Nouveau",
  children,
}: FormCardProps) {
  return (
    <div className="glass-card p-6 shrink-0">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {badge && (
          <span className="bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-xs font-medium">
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
