/**
 * Renders a Google Material Symbols Outlined icon.
 * Requires the Material Symbols stylesheet to be loaded (see layout.tsx head).
 */

import { cn } from "@/lib/utils";

interface MaterialIconProps {
  /** The icon name, e.g. "icecream", "menu", "arrow_forward" */
  name: string;
  /** Apply the filled variant */
  filled?: boolean;
  /** Additional Tailwind classes */
  className?: string;
}

export function MaterialIcon({ name, filled, className }: MaterialIconProps) {
  return (
    <span
      className={cn("material-symbols-outlined", filled && "filled", className)}
      style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
    >
      {name}
    </span>
  );
}
