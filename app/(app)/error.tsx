"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/40">
        <TriangleAlert className="size-6" />
      </span>
      <div>
        <h1 className="text-lg font-semibold">Algo salió mal</h1>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Ocurrió un error inesperado. Inténtalo de nuevo — los datos de tu
          pipeline están a salvo.
        </p>
      </div>
      <Button size="sm" onClick={reset}>
        Reintentar
      </Button>
    </div>
  );
}
