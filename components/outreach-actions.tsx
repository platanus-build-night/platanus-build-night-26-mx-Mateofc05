"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Mail,
  MailOpen,
  Reply,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  approveOutreach,
  escalateOutreach,
  mockOpen,
  mockReply,
  sendOutreach,
  type ActionResult,
} from "@/app/actions";
import type { OutreachStatus } from "@/lib/types";

type ActionFn = (id: string) => Promise<ActionResult>;

export function OutreachActions({
  id,
  status,
  variant = "full",
}: {
  id: string;
  status: OutreachStatus;
  variant?: "full" | "row";
}) {
  const [pending, start] = useTransition();
  const router = useRouter();

  function run(fn: ActionFn) {
    start(async () => {
      const res = await fn(id);
      if (res.ok) toast.success(res.message ?? "Listo.");
      else toast.error(res.message ?? "Acción no permitida.");
      router.refresh();
    });
  }

  const canApprove = status === "DRAFT";
  const canSend = status === "DRAFT" || status === "APPROVED";
  const canOpen = status === "SENT";
  const canReply = status === "SENT" || status === "OPENED";
  const canEscalate = status !== "BLOCKED" && status !== "ESCALATED";

  const size = variant === "row" ? "sm" : "default";

  if (variant === "row") {
    // Compact: only the most relevant next step(s).
    return (
      <div className="flex items-center justify-end gap-1.5">
        {canSend && (
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => run(sendOutreach)}
          >
            {pending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Mail className="size-3.5" />
            )}
            Enviar
          </Button>
        )}
        {canOpen && (
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => run(mockOpen)}
          >
            <MailOpen className="size-3.5" />
            Abrir
          </Button>
        )}
        {canReply && (
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => run(mockReply)}
          >
            <Reply className="size-3.5" />
            Responder
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        size={size}
        variant="outline"
        disabled={pending || !canApprove}
        onClick={() => run(approveOutreach)}
      >
        <CheckCircle2 className="size-4" />
        Aprobar
      </Button>
      <Button
        size={size}
        disabled={pending || !canSend}
        onClick={() => run(sendOutreach)}
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Mail className="size-4" />
        )}
        Enviar
      </Button>
      <Button
        size={size}
        variant="outline"
        disabled={pending || !canOpen}
        onClick={() => run(mockOpen)}
      >
        <MailOpen className="size-4" />
        Simular apertura
      </Button>
      <Button
        size={size}
        variant="outline"
        disabled={pending || !canReply}
        onClick={() => run(mockReply)}
      >
        <Reply className="size-4" />
        Simular respuesta
      </Button>
      <Button
        size={size}
        variant="ghost"
        disabled={pending || !canEscalate}
        onClick={() => run(escalateOutreach)}
      >
        <AlertTriangle className="size-4" />
        Escalar
      </Button>
    </div>
  );
}
