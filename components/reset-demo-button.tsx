"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resetDemo } from "@/app/actions";

export function ResetDemoButton() {
  const [pending, start] = useTransition();
  const router = useRouter();

  function onClick() {
    start(async () => {
      const res = await resetDemo();
      if (res.ok) toast.success(res.message ?? "Pipeline reiniciado.");
      else toast.error(res.message ?? "No se pudo reiniciar.");
      router.refresh();
    });
  }

  return (
    <Button variant="outline" size="sm" disabled={pending} onClick={onClick}>
      {pending ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <RotateCcw className="size-3.5" />
      )}
      Reiniciar demo
    </Button>
  );
}
