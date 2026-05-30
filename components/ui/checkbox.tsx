import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Native checkbox styled with accent-color to match the brand. Dependency-free.
 */
function Checkbox({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type="checkbox"
      data-slot="checkbox"
      className={cn(
        "size-4 shrink-0 rounded-[5px] border border-input bg-transparent accent-brand shadow-xs outline-none transition-[box-shadow]",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  )
}

export { Checkbox }
