import Link from "next/link";
import { ArrowUpRight, Inbox, ShieldCheck, UserCheck } from "lucide-react";
import { PageHeader } from "@/components/app-shell";
import { MetricsGrid } from "@/components/metrics-grid";
import { AthleteCard } from "@/components/athlete-card";
import { StatusBadge } from "@/components/status-badge";
import { OutreachActions } from "@/components/outreach-actions";
import { ResetDemoButton } from "@/components/reset-demo-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getAthletes,
  getOutreachRows,
  getOutreaches,
  getSendUsage,
} from "@/lib/store";
import { computeMetrics } from "@/lib/metrics";
import { scorePct } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [athletes, outreaches, rows, usage] = await Promise.all([
    getAthletes(),
    getOutreaches(),
    getOutreachRows(),
    getSendUsage(),
  ]);

  const metrics = computeMetrics(outreaches, athletes.length);
  const pipelineByAthlete = outreaches.reduce<Record<string, number>>(
    (m, o) => ((m[o.athleteId] = (m[o.athleteId] ?? 0) + 1), m),
    {},
  );

  return (
    <>
      <PageHeader
        title="Centro de control"
        description="El pipeline de contacto de reclutamiento de tu agencia, de un vistazo."
        actions={
          <>
            <Badge variant="outline" className="gap-1.5">
              <UserCheck className="size-3.5" />
              Aprobación humana requerida
            </Badge>
            <Badge variant="outline" className="hidden gap-1.5 sm:inline-flex">
              <ShieldCheck className="size-3.5" />
              Revisión manual NCAA
            </Badge>
            <Badge variant="secondary" className="tabular-nums">
              {usage.used}/{usage.limit} envíos hoy
            </Badge>
            <ResetDemoButton />
          </>
        }
      />

      <div className="space-y-8 p-6">
        <MetricsGrid metrics={metrics} />

        {/* Athletes */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Atletas</h2>
            <Link
              href="/athletes"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              Ver todos
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {athletes.map((a) => (
              <AthleteCard
                key={a.id}
                athlete={a}
                pipelineCount={pipelineByAthlete[a.id] ?? 0}
              />
            ))}
          </div>
        </section>

        {/* Outreach pipeline */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold">Pipeline de contacto</h2>
          {rows.length === 0 ? (
            <Card className="flex flex-col items-center justify-center gap-2 p-10 text-center">
              <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Inbox className="size-5" />
              </span>
              <p className="text-sm font-medium">Aún no hay contacto</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Elige un atleta y haz clic en{" "}
                <span className="font-medium text-foreground">Generar</span> para
                crear campañas listas para entrenadores.
              </p>
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
        </section>
      </div>
    </>
  );
}
