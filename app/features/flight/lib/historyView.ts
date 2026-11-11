import type { MapIntent } from "~/app-state/useMapSettings";
import { WHOLE_ROUTE } from "~/features/flight/lib/trackingView";

export enum HistoryView {
  History = "history",
  Documents = "documents",
}

export enum HistoryTab {
  Route = "route",
  FuelAndCrew = "fuel-and-crew",
  Passengers = "passengers",
  Cargo = "cargo",
  OperationalFlightPlan = "ofp",
  RunwayAnalysis = "runway-analysis",
  Events = "events",
  Delays = "delays",
}

export type HistoryLocation = {
  view: HistoryView;
  tab: HistoryTab;
};

const SIMBRIEF_TABS = new Set([HistoryTab.Route, HistoryTab.OperationalFlightPlan, HistoryTab.RunwayAnalysis]);

export const HISTORY_MAP_INTENT: MapIntent = { label: "Whole flight", view: WHOLE_ROUTE };

export function needsSimbrief(tab: HistoryTab): boolean {
  return SIMBRIEF_TABS.has(tab);
}

export function defaultHistoryTab(isSimbriefAvailable: boolean): HistoryTab {
  return isSimbriefAvailable ? HistoryTab.Route : HistoryTab.FuelAndCrew;
}

export function resolveHistoryLocation(
  viewSlug: string | undefined,
  tabSlug: string | undefined,
  isSimbriefAvailable: boolean,
): HistoryLocation {
  const view = viewSlug === HistoryView.Documents ? HistoryView.Documents : HistoryView.History;
  const requested = Object.values(HistoryTab).find((tab) => tab === tabSlug);
  const available = requested !== undefined && (isSimbriefAvailable || !needsSimbrief(requested));

  return { view, tab: available ? requested : defaultHistoryTab(isSimbriefAvailable) };
}

export function historyFlightPath(flightId: string, view = HistoryView.History, tab?: HistoryTab): string {
  const path = `/flight-history/${flightId}`;

  if (view === HistoryView.History) {
    return path;
  }

  return tab === undefined ? `${path}/${HistoryView.Documents}` : `${path}/${HistoryView.Documents}/${tab}`;
}
