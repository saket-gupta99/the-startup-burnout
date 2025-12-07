import type { ReactNode } from "react";
import { cn } from "../libs/utils";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "basic" | "error";
  type?: "submit" | "button";
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

const variantClass: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "w-full px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition bg-amber-400 px-4 py-2 hover:bg-amber-300",
  secondary:
    "w-full bg-new-blue hover:bg-new-blue-2 text-white border border-slate-300 px-4 py-2.5 font-medium",
  basic: "border border-slate-600 rounded-md py-1 px-3 bg-white text-black",
  error:
    "text-xs font-semibold uppercase tracking-wide text-red-700 hover:underline",
};

const baseClass =
  "inline-flex cursor-pointer  items-center justify-center gap-2 rounded-lg text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:opacity-60 disabled:cursor-not-allowed";

export default function Button({
  variant = "primary",
  type = "button",
  className = "",
  disabled = false,
  onClick = () => {},
  children,
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(baseClass, variantClass[variant], className)}
    >
      {children}
    </button>
  );
}
