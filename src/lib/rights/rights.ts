import type { NasaAsset, RightsStatus } from "../nasa/types";

export interface RightsDecision {
  status: RightsStatus;
  canAddToProgram: boolean;
  requiresAcknowledgement: boolean;
  label: string;
  reason: string;
}

const LABELS: Record<RightsStatus, string> = {
  broadcast_ok: "BROADCAST OK",
  review: "REVIEW",
  blocked: "BLOQUEADO",
};

export function evaluateRights(asset: NasaAsset): RightsDecision {
  if (asset.rightsStatus === "blocked" || !asset.broadcastAllowed || asset.youtubeAllowed === "blocked") {
    return {
      status: "blocked",
      canAddToProgram: false,
      requiresAcknowledgement: false,
      label: LABELS.blocked,
      reason:
        asset.notes ||
        "Material de terceiros ou música sob licença detectada — transmissão não autorizada.",
    };
  }

  if (asset.rightsStatus === "review" || asset.youtubeAllowed === "review" || asset.thirdPartyContent) {
    return {
      status: "review",
      canAddToProgram: true,
      requiresAcknowledgement: true,
      label: LABELS.review,
      reason: asset.notes || "Requer revisão de direitos antes da transmissão.",
    };
  }

  return {
    status: "broadcast_ok",
    canAddToProgram: true,
    requiresAcknowledgement: false,
    label: LABELS.broadcast_ok,
    reason: "Domínio público, liberado para programação e transmissão no YouTube.",
  };
}

export interface ProgramRightsSummary {
  ok: number;
  review: number;
  blocked: number;
  pendingAcknowledgement: number;
  clear: boolean;
}

export function summarizeRights(
  entries: { asset: NasaAsset; acknowledgedReview: boolean }[],
): ProgramRightsSummary {
  let ok = 0;
  let review = 0;
  let blocked = 0;
  let pendingAcknowledgement = 0;

  for (const entry of entries) {
    const decision = evaluateRights(entry.asset);
    if (decision.status === "blocked") blocked += 1;
    else if (decision.status === "review") {
      review += 1;
      if (!entry.acknowledgedReview) pendingAcknowledgement += 1;
    } else ok += 1;
  }

  return { ok, review, blocked, pendingAcknowledgement, clear: blocked === 0 && pendingAcknowledgement === 0 };
}
