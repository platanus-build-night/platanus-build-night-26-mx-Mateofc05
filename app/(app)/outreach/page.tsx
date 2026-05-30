import Link from "next/link";
import { Inbox } from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { OutreachActions } from "@/components/outreach-actions";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getOutreachRows } from "@/lib/store";
import { scorePct } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function OutreachPage() {
  const rows = await getOutreachRows();

  return (
    <>
      <PageHeader
        title="Contacto"
        description="Emails y fichas listos para entrenadores en todo tu pipeline."
      />
      <div className="p-6">
        {rows.length === 0 ? (
          <Card className="flex flex-col items-center justify-center gap-2 p-12 text-center">
            <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Inbox className="size-5" />
            </span>
            <p className="text-sm font-medium">Aún no hay contacto</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Genera una campaña desde el perfil de un atleta para ver aquí los
              borradores listos para entrenadores.
            </p>
            <Link
              href="/dashboard"
              className="mt-1 text-sm font-medium text-brand hover:underline"
            >
              Ir al centro de control
            </Link>
          </Card>
        ) : (
          <Card className="overflow-hidden p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Atleta</TableHead>
                  <TableHead>Programa</TableHead>
                  <TableHead className="hidden md:table-cell">Entrenador</TableHead>
                  <TableHead className="text-right">Puntaje</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(({ outreach, athlete, program, coach }) => (
                  <TableRow key={outreach.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/outreach/${outreach.id}`}
                        className="hover:underline"
                      >
                        {athlete?.fullName ?? "—"}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{program?.school ?? "—"}</span>
                      <span className="ml-1.5 text-xs text-muted-foreground">
                        {program?.division}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {coach?.name ?? "—"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-medium">
                      {scorePct(outreach.matchScore)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={outreach.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1.5">
                        <OutreachActions
                          id={outreach.id}
                          status={outreach.status}
                          variant="row"
                        />
                        <Link
                          href={`/outreach/${outreach.id}`}
                          className="text-sm text-muted-foreground hover:text-foreground"
                        >
                          Ver
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </>
  );
}
