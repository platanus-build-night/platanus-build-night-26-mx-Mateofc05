import Link from "next/link";
import { Logo } from "@/components/logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
      <Logo />
      <div>
        <p className="text-5xl font-semibold tracking-tight">404</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Esta página no existe.
        </p>
      </div>
      <Link href="/" className={cn(buttonVariants({ size: "sm" }))}>
        Ir al inicio
      </Link>
    </div>
  );
}
