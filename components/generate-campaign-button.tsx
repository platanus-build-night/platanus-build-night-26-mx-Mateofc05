"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateCampaign } from "@/app/actions";

export function GenerateCampaignButton({
  athleteId,
  label = "Generar campaña de reclutamiento",
  size = "default",
  variant = "default",
}: {
  athleteId: string;
  label?: string;
  size?: "default" | "sm" | "lg";
  variant?: "default" | "outline" | "secondary";
}) {
  const [pending, start] = useTransition();
  const router = useRouter();

  function onClick() {
    start(async () => {
      const res = await generateCampaign(athleteId);
      if (res.ok) toast.success(res.message);
      else toast.error(res.message ?? "Algo salió mal.");
      router.refresh();
    });
  }

  return (
    <Button onClick={onClick} disabled={pending} size={size} variant={variant}>
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Sparkles className="size-4" />
      )}
      {pending ? "Generando…" : label}
    </Button>
  );
}
