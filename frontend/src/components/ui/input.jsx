import * as React from "react";
import { cn } from "../../lib/utils";

const Input = React.forwardRef(({ className, type, error, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-xl border bg-white dark:bg-slate-800/50 px-4 py-2 text-sm text-slate-900 dark:text-white ring-offset-white dark:ring-offset-slate-900 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
        error
          ? "border-red-500 focus-visible:ring-red-500"
          : "border-slate-200 dark:border-slate-700 focus-visible:ring-blue-500 focus-visible:border-blue-500 dark:focus-visible:border-blue-500",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
