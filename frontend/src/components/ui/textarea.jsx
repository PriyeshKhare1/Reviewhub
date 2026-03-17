import React from "react"
import { cn } from "../../lib/utils"

const Textarea = React.forwardRef(({ className = "", error, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[120px] w-full rounded-xl border-2 bg-white dark:bg-slate-800/50 px-4 py-3 text-sm text-slate-900 dark:text-white transition-all duration-200",
        "border-slate-200 dark:border-slate-700",
        "placeholder:text-slate-400 dark:placeholder:text-slate-500",
        "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-900",
        "resize-none",
        error && "border-red-500 dark:border-red-400 focus:ring-red-500/20 focus:border-red-500",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }