import React from "react";

interface PageHeaderProps {
  title: string;
  description: string;
  children?: React.ReactNode;
}

export default function PageHeader({
  title,
  description,
  children,
}: PageHeaderProps) {
  return (
    <div className="shrink-0 flex justify-between items-start sm:items-center flex-col sm:flex-row gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-md">
          {title}
        </h1>
        <p className="text-white/80 mt-1 text-sm">{description}</p>
      </div>
      {children && <div className="flex gap-2">{children}</div>}
    </div>
  );
}
