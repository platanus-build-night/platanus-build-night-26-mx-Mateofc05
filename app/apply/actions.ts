"use server";

import { revalidatePath } from "next/cache";
import {
  createAthleteFromApplication,
  type ApplicationInput,
} from "@/lib/applications";

export interface ApplyState {
  ok: boolean;
  message?: string;
  athleteId?: string;
  athleteName?: string;
  errors?: Record<string, string>;
}

function str(formData: FormData, name: string): string | undefined {
  const v = formData.get(name);
  return typeof v === "string" && v.trim() !== "" ? v : undefined;
}

export async function submitAthleteApplication(
  _prev: ApplyState,
  formData: FormData,
): Promise<ApplyState> {
  const input: ApplicationInput = {
    fullName: str(formData, "fullName"),
    country: str(formData, "country"),
    position: str(formData, "position"),
    gradYear: str(formData, "gradYear"),
    heightCm: str(formData, "heightCm"),
    dominantFoot: str(formData, "dominantFoot"),
    gpaEquivalent: str(formData, "gpaEquivalent"),
    englishTestType: str(formData, "englishTestType"),
    englishTestScore: str(formData, "englishTestScore"),
    goals: str(formData, "goals"),
    assists: str(formData, "assists"),
    matches: str(formData, "matches"),
    passAccuracy: str(formData, "passAccuracy"),
    videoUrl: str(formData, "videoUrl"),
    isMinor: formData.get("isMinor") != null,
    parentalConsent: formData.get("parentalConsent") != null,
  };

  const result = await createAthleteFromApplication(input);

  if (!result.ok) {
    return {
      ok: false,
      message: "Por favor corrige los campos resaltados e inténtalo de nuevo.",
      errors: result.errors,
    };
  }

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/athletes");

  return {
    ok: true,
    athleteId: result.athlete.id,
    athleteName: result.athlete.fullName,
    message: `${result.athlete.fullName} fue agregado al panel de la agencia.`,
  };
}
