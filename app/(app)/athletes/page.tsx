import { PageHeader } from "@/components/app-shell";
import { AthleteCard } from "@/components/athlete-card";
import { Badge } from "@/components/ui/badge";
import { UserCheck } from "lucide-react";
import { getAthletes, getOutreaches } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function AthletesPage() {
  const [athletes, outreaches] = await Promise.all([
    getAthletes(),
    getOutreaches(),
  ]);

  const pipelineByAthlete = outreaches.reduce<Record<string, number>>(
    (m, o) => ((m[o.athleteId] = (m[o.athleteId] ?? 0) + 1), m),
    {},
  );

  return (
    <>
      <PageHeader
        title="Atletas"
        description="Atletas de fútbol hispanohablantes representados por tu agencia."
        actions={
          <Badge variant="outline" className="gap-1.5">
            <UserCheck className="size-3.5" />
            {athletes.length} activos
          </Badge>
        }
      />
      <div className="p-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {athletes.map((a) => (
            <AthleteCard
              key={a.id}
              athlete={a}
              pipelineCount={pipelineByAthlete[a.id] ?? 0}
            />
          ))}
        </div>
      </div>
    </>
  );
}
