import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-lg bg-brand text-brand-foreground shadow-sm",
        className,
      )}
      aria-hidden
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="size-5"
        strokeWidth={2.2}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Three ascending "line-up" bars */}
        <path d="M5 16v3" />
        <path d="M12 11v8" />
        <path d="M19 6v13" />
      </svg>
    </span>
  );
}

export function Wordmark({
  className,
  showDot = true,
}: {
  className?: string;
  showDot?: boolean;
}) {
  return (
    <span className={cn("text-[15px] font-semibold tracking-tight", className)}>
      Line<span className="text-brand">Up</span>
      {showDot && <span className="text-brand">.</span>}
    </span>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <Wordmark />
    </span>
  );
}
