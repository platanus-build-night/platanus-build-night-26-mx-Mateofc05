// Deterministic formatting helpers. Date formatting is fixed to es-ES / UTC so
// server-rendered output is stable (no locale/timezone hydration drift).

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(iso));
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : "";
  return (first + last).toUpperCase();
}

export function scorePct(score: number): string {
  return `${Math.round(score * 100)}%`;
}
