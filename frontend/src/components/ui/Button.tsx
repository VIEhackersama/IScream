import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "outline" | "dark" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/25",
  outline:
    "bg-white dark:bg-surface-dark border-2 border-primary/10 hover:border-primary/30 text-text-main dark:text-white",
  dark: "bg-text-main dark:bg-white text-white dark:text-text-main hover:opacity-90 shadow-xl",
  ghost: "bg-transparent hover:bg-primary/10 text-text-main dark:text-white",
};

export function Button({
  variant = "primary",
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex cursor-pointer items-center justify-center rounded-full font-bold tracking-wide transition-all",
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
