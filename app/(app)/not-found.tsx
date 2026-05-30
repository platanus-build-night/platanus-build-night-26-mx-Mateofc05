import Link from "next/link";
import { SearchX } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AppNotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <SearchX className="size-6" />
      </span>
      <div>
        <h1 className="text-lg font-semibold">No encontrado</h1>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Ese atleta o contacto no existe — puede que se haya reiniciado.
        </p>
      </div>
      <Link href="/dashboard" className={cn(buttonVariants({ size: "sm" }))}>
        Volver al centro de control
      </Link>
    </div>
  );
}
