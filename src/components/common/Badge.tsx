import { cn } from "@/utils/cn";
import type { ProductStatus } from "@/types";

const statusConfig: Record<
  ProductStatus,
  { label: string; className: string }
> = {
  active: {
    label: "Ativo",
    className: "bg-green-50 text-green-700 border border-green-200",
  },
  inactive: {
    label: "Inativo",
    className: "bg-gray-50 text-gray-600 border border-gray-200",
  },
  low_stock: {
    label: "Estoque Baixo",
    className: "bg-amber-50 text-amber-700 border border-amber-200",
  },
};

interface StatusBadgeProps {
  status: ProductStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center px-[8px] py-[2px] rounded-[6px] text-xs font-medium",
        config.className,
        className,
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70" />
      {config.label}
    </span>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  color?: "red" | "blue" | "green" | "gray" | "purple";
  className?: string;
}

const colors = {
  red: "bg-red-50 text-red-700 border border-red-200",
  blue: "bg-blue-50 text-blue-700 border border-blue-200",
  green: "bg-green-50 text-green-700 border border-green-200",
  gray: "bg-gray-50 text-gray-600 border border-gray-200",
  purple: "bg-purple-50 text-purple-700 border border-purple-200",
};

export function Badge({ children, color = "gray", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-[8px] py-[2px] rounded-[6px] text-xs font-medium",
        colors[color],
        className,
      )}
    >
      {children}
    </span>
  );
}
