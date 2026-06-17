import * as React from "react";
import { cn } from "@/lib/utils";

const variants = {
  default: "bg-holo/15 text-holo border border-holo/30 hover:bg-holo/25",
  ghost: "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60",
  solid: "bg-holo text-deep font-semibold hover:bg-holo/90",
};

const sizes = {
  sm: "h-8 px-3 text-xs",
  md: "h-9 px-4 text-sm",
  icon: "h-8 w-8",
};

export const Button = React.forwardRef(
  ({ className, variant = "default", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-holo/50 disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";
