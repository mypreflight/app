import type { DisplayMode, MapIntent, MapView } from "~/app-state/useMapSettings";
import {
  type BriefingDocument,
  type BriefingPhase,
  DOCUMENT_PARAM,
  findBriefingDocument,
  findBriefingPhase,
  retiredBriefingTab,
} from "~/features/flight/lib/briefingPhase";
import { isBeforeOffBlock } from "~/features/flight/lib/flightPhase";
import { FlightStatus } from "~/features/flight/model";

export enum TrackingView {
  Briefing = "briefing",
  Tracking = "tracking",
}

export type TrackingLocation = {
  view: TrackingView;
  phase: BriefingPhase | null;
  document: BriefingDocument | null;
};

type ActiveEnd = "departure" | "destination";

export const WHOLE_ROUTE: MapView = {
  centerOn: "route",
  autoCenter: true,
  runwayDisplay: "assigned",
  terminalDisplay: "none",
  gateDisplay: "none",
  parkingPositionDisplay: "none",
};

function apron(end: ActiveEnd, gateDisplay: DisplayMode): MapView {
  return {
    centerOn: end,
    autoCenter: true,
    runwayDisplay: "all",
    terminalDisplay: "assigned",
    gateDisplay,
    parkingPositionDisplay: "assigned",
  };
}

function runways(end: ActiveEnd): MapView {
  return {
    centerOn: end,
    autoCenter: true,
    runwayDisplay: "all",
    terminalDisplay: "none",
    gateDisplay: "none",
    parkingPositionDisplay: "none",
  };
}

export function automaticTrackingView(status: FlightStatus): TrackingView {
  return isBeforeOffBlock(status) ? TrackingView.Briefing : TrackingView.Tracking;
}

export function resolveTrackingLocation(
  status: FlightStatus,
  viewSlug: string | undefined,
  tabSlug: string | undefined,
  documentParam: string | null = null,
): TrackingLocation {
  const view = Object.values(TrackingView).find((candidate) => candidate === viewSlug);

  if (view === TrackingView.Tracking) {
    return { view, phase: null, document: findBriefingDocument(documentParam) };
  }

  if (view === TrackingView.Briefing) {
    const retired = retiredBriefingTab(tabSlug);

    return retired === null
      ? { view, phase: findBriefingPhase(tabSlug), document: findBriefingDocument(documentParam) }
      : { view, ...retired };
  }

  const retired = tabSlug === undefined ? retiredBriefingTab(viewSlug) : null;

  if (retired !== null) {
    return { view: TrackingView.Briefing, ...retired };
  }

  return { view: automaticTrackingView(status), phase: null, document: null };
}

export function trackFlightPath(
  flightId: string,
  view: TrackingView,
  phase: BriefingPhase | null = null,
  document: BriefingDocument | null = null,
): string {
  const path = `/track/${flightId}/${view}`;
  const withPhase = view === TrackingView.Briefing && phase !== null ? `${path}/${phase}` : path;

  return document === null ? withPhase : `${withPhase}?${DOCUMENT_PARAM}=${document}`;
}

export function trackingMapIntent(status: FlightStatus): MapIntent {
  if (isBeforeOffBlock(status)) {
    return { label: "Departure stand", view: apron("departure", "assigned") };
  }

  switch (status) {
    case FlightStatus.TaxiingOut:
      return { label: "Taxi out", view: runways("departure") };
    case FlightStatus.InCruise:
      return { label: "Cruise", view: WHOLE_ROUTE };
    case FlightStatus.TaxiingIn:
      return { label: "Taxi in", view: apron("destination", "none") };
    default:
      return { label: "Arrival stand", view: apron("destination", "assigned") };
  }
}
