import Link from "next/link";
import { Logo } from "@/components/logo";
import { SidebarNav } from "@/components/sidebar-nav";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r bg-sidebar px-3 py-4 md:flex">
        <Link href="/" className="px-2 py-1">
          <Logo />
        </Link>

        <div className="mt-6 px-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Operaciones
        </div>
        <div className="mt-2">
          <SidebarNav />
        </div>

        <div className="mt-auto space-y-3">
          <div className="rounded-lg border bg-card p-3">
            <div className="flex items-center gap-2">
              <Avatar className="size-7">
                <AvatarFallback className="bg-brand text-brand-foreground text-[11px]">
                  GA
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">Golazo Agency</p>
                <p className="truncate text-xs text-muted-foreground">
                  Espacio demo
                </p>
              </div>
            </div>
          </div>
          <Badge
            variant="secondary"
            className="w-full justify-center text-[11px] font-normal"
          >
            Hecho para agencias
          </Badge>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex items-center justify-between border-b px-4 py-3 md:hidden">
          <Link href="/">
            <Logo />
          </Link>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
