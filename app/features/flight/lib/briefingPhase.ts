import { FlightStatus } from "~/features/flight/model";
import { type OceanicCrossing, OceanicRouting, type OceanicTrack, type PlannedRouteFix } from "~/features/route/model";

export enum BriefingPhase {
  Preflight = "preflight",
  EnRoute = "en-route",
  Arrival = "arrival",
}

export const BRIEFING_PHASES: BriefingPhase[] = [BriefingPhase.Preflight, BriefingPhase.EnRoute, BriefingPhase.Arrival];

export enum BriefingDocument {
  NavLog = "nav-log",
  Ofp = "ofp",
  RunwayAnalysis = "runway-analysis",
  Notoc = "notoc",
  Pil = "pil",
  Cabin = "cabin",
  Cargo = "cargo",
  Timesheet = "timesheet",
  Activity = "activity",
  Delay = "delay",
  Emergencies = "emergencies",
}

export type BriefingLocation = {
  phase: BriefingPhase | null;
  document: BriefingDocument | null;
};

export type PhaseState = "done" | "now" | "next";

export const DOCUMENT_PARAM = "document";
export const NO_PASSENGERS = "Cargo flights carry no passengers.";

const RETIRED_TABS: Record<string, BriefingLocation> = {
  overview: { phase: null, document: null },
  "fuel-and-crew": { phase: BriefingPhase.Preflight, document: null },
  route: { phase: BriefingPhase.EnRoute, document: null },
  passengers: { phase: null, document: BriefingDocument.Cabin },
  cargo: { phase: null, document: BriefingDocument.Cargo },
  progress: { phase: null, document: BriefingDocument.Timesheet },
  ofp: { phase: null, document: BriefingDocument.Ofp },
  "runway-analysis": { phase: null, document: BriefingDocument.RunwayAnalysis },
  emergencies: { phase: null, document: BriefingDocument.Emergencies },
  delays: { phase: null, document: BriefingDocument.Delay },
};

const AFTER_LANDING: ReadonlySet<FlightStatus> = new Set([
  FlightStatus.TaxiingIn,
  FlightStatus.OnBlock,
  FlightStatus.OffboardingStarted,
  FlightStatus.OffboardingFinished,
  FlightStatus.Closed,
]);

const DESCENT_STAGE = "DSC";
const COORDINATE_TOLERANCE = 0.01;

export function findBriefingPhase(slug: string | undefined): BriefingPhase | null {
  return BRIEFING_PHASES.find((phase) => phase === slug) ?? null;
}

export function findBriefingDocument(value: string | null | undefined): BriefingDocument | null {
  return Object.values(BriefingDocument).find((document) => document === value) ?? null;
}

export function retiredBriefingTab(slug: string | undefined): BriefingLocation | null {
  return slug === undefined ? null : (RETIRED_TABS[slug] ?? null);
}

export function topOfDescentAt(fixes: PlannedRouteFix[], takeoffTime: Date | null): Date | null {
  const firstDescent = fixes.findIndex((fix) => fix.stage === DESCENT_STAGE);

  if (takeoffTime === null || firstDescent < 1) {
    return null;
  }

  return new Date(takeoffTime.getTime() + fixes[firstDescent - 1].elapsedSeconds * 1000);
}

export function currentBriefingPhase(status: FlightStatus, topOfDescent: Date | null, now: Date): BriefingPhase {
  if (AFTER_LANDING.has(status)) {
    return BriefingPhase.Arrival;
  }

  if (status !== FlightStatus.InCruise) {
    return BriefingPhase.Preflight;
  }

  return topOfDescent !== null && now >= topOfDescent ? BriefingPhase.Arrival : BriefingPhase.EnRoute;
}

export function briefingPhaseState(phase: BriefingPhase, current: BriefingPhase): PhaseState {
  const position = BRIEFING_PHASES.indexOf(phase);
  const currentPosition = BRIEFING_PHASES.indexOf(current);

  if (position < currentPosition) {
    return "done";
  }

  return position === currentPosition ? "now" : "next";
}

export function hasOceanicTrack(crossing: OceanicCrossing | null | undefined): boolean {
  return crossing !== null && crossing !== undefined && crossing.routing !== OceanicRouting.Random;
}

export function flownTrack(crossing: OceanicCrossing | null | undefined): OceanicTrack | null {
  if (!hasOceanicTrack(crossing) || crossing === null || crossing === undefined) {
    return null;
  }

  return crossing.tracks.find((track) => track.identifier === crossing.trackId) ?? null;
}

function isOnTrack(fix: PlannedRouteFix, track: OceanicTrack): boolean {
  const routeIdents = new Set((track.route ?? "").split(/\s+/).filter(Boolean));

  return (
    routeIdents.has(fix.ident) ||
    track.fixes.some(
      (trackFix) =>
        Math.abs(trackFix.latitude - fix.latitude) < COORDINATE_TOLERANCE &&
        Math.abs(trackFix.longitude - fix.longitude) < COORDINATE_TOLERANCE,
    )
  );
}

export function enRouteFixes(fixes: PlannedRouteFix[]): PlannedRouteFix[] {
  return fixes.slice(1, -1);
}

export function oceanicFixes(
  fixes: PlannedRouteFix[],
  crossing: OceanicCrossing | null | undefined,
): PlannedRouteFix[] {
  const track = flownTrack(crossing);

  return track === null ? [] : fixes.filter((fix) => isOnTrack(fix, track));
}
