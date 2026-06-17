import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-9 w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3 text-sm text-slate-200 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-holo/40 focus-visible:border-holo/40",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";
