import type { MuseEvalResult, MusePainPoint, MuseRoleIntent } from "./types";

export type EvolutionCandidate = {
  id: string;
  createdAt: string;
  source: "conversation" | "eval" | "review";
  roleIntent: MuseRoleIntent;
  painPoint: MusePainPoint;
  status: "queued" | "testing" | "kept" | "discarded";
};

export function painPointsFromEval(result: MuseEvalResult): MusePainPoint[] {
  return result.failures.map((failure) => ({
    category: failure.includes("leak") ? "leakage_risk" : failure.includes("tone") ? "tone_drift" : "missing_context",
    severity: result.leakagePass && result.safetyPass ? "medium" : "high",
    signal: failure,
    suggestedAction: failure.includes("corpus") ? "corpus_candidate" : "eval_candidate",
  }));
}

export function createEvolutionCandidate(roleIntent: MuseRoleIntent, painPoint: MusePainPoint): EvolutionCandidate {
  return {
    id: `candidate_${crypto.randomUUID()}`,
    createdAt: new Date().toISOString(),
    source: "conversation",
    roleIntent,
    painPoint,
    status: "queued",
  };
}
