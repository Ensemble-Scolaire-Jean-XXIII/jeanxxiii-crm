import { useTheme } from "../contexts/ThemeContext";
import { FormCardProps } from "../types";

export default function FormCard({
  title,
  badge = "Nouveau",
  children,
}: FormCardProps) {
  const { t } = useTheme();

  return (
    <div className={`${t.card} shrink-0`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        {badge && (
          <span className="bg-(--border-color) text-(--text-main) px-3 py-1 rounded-full text-xs font-medium">
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
