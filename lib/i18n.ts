// Spanish display helpers — used on the left side of the wow split view to make
// the Spanish-profile → English-outreach transformation unmistakable.

import type { Athlete, RosterNeed } from "@/lib/types";

const COUNTRY_ES: Record<string, string> = {
  Mexico: "México",
  Colombia: "Colombia",
  Argentina: "Argentina",
  Spain: "España",
  Chile: "Chile",
};

const FOOT_ES: Record<string, string> = {
  Right: "Derecho",
  Left: "Izquierdo",
  Both: "Ambos",
};

const POSITION_ES: Record<RosterNeed, string> = {
  winger: "Extremo",
  striker: "Delantero",
  "center back": "Defensa central",
  goalkeeper: "Portero",
  midfielder: "Mediocampista",
};

export function countryEs(country: string): string {
  return COUNTRY_ES[country] ?? country;
}

export function footEs(foot: string): string {
  return FOOT_ES[foot] ?? foot;
}

export function positionEs(need: RosterNeed): string {
  return POSITION_ES[need] ?? need;
}

export function positionsEs(athlete: Athlete): string {
  return athlete.positions.map(positionEs).join(" / ");
}
