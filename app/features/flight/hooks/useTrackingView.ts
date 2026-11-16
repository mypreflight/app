import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams, useViewTransitionState } from "react-router";
import { type BriefingPhase, DOCUMENT_PARAM } from "~/features/flight/lib/briefingPhase";
import {
  automaticTrackingView,
  resolveTrackingLocation,
  type TrackingLocation,
  TrackingView,
  trackFlightPath,
} from "~/features/flight/lib/trackingView";
import { type Flight, FlightStatus } from "~/features/flight/model";

type AutomaticView = {
  flightId: string;
  view: TrackingView;
};

export type TrackingViewState = TrackingLocation & {
  pathTo: (view: TrackingView) => string;
};

function canonicalPath(flight: Flight, location: TrackingLocation): string {
  return flight.status === FlightStatus.Closed
    ? `/flight-history/${flight.id}`
    : trackFlightPath(flight.id, location.view, location.phase, location.document);
}

export function useTrackingView(
  flightId: string,
  flight: Flight | null,
  viewSlug: string | undefined,
  tabSlug: string | undefined,
): TrackingViewState | null {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const [briefingPhase, setBriefingPhase] = useState<BriefingPhase | null>(null);
  const lastAutomaticView = useRef<AutomaticView | null>(null);

  const loaded = flight?.id === flightId ? flight : null;
  const documentParam = new URLSearchParams(search).get(DOCUMENT_PARAM);
  const location = loaded && resolveTrackingLocation(loaded.status, viewSlug, tabSlug, documentParam);
  const target = loaded && location && canonicalPath(loaded, location);
  const automaticView = loaded && automaticTrackingView(loaded.status);

  if (location?.view === TrackingView.Briefing && location.phase !== briefingPhase) {
    setBriefingPhase(location.phase);
  }

  const current = documentParam === null ? pathname : `${pathname}?${DOCUMENT_PARAM}=${documentParam}`;

  useEffect(() => {
    if (target !== null && target !== current) {
      navigate(target, { replace: true });
    }
  }, [target, current, navigate]);

  useEffect(() => {
    if (automaticView === null) {
      return;
    }

    const previous = lastAutomaticView.current;
    lastAutomaticView.current = { flightId, view: automaticView };

    if (previous?.flightId === flightId && previous.view !== automaticView) {
      navigate(trackFlightPath(flightId, automaticView), { viewTransition: true });
    }
  }, [flightId, automaticView, navigate]);

  if (location === null) {
    return null;
  }

  return {
    ...location,
    pathTo: (view) => trackFlightPath(flightId, view, briefingPhase),
  };
}

export function useCurrentTrackingView(): TrackingView {
  return useParams().view === TrackingView.Tracking ? TrackingView.Tracking : TrackingView.Briefing;
}

export function useIsSwitchingTrackingView(flightId: string): boolean {
  const involvesTracking = useViewTransitionState(trackFlightPath(flightId, TrackingView.Tracking));
  const involvesBriefing = useViewTransitionState(`${trackFlightPath(flightId, TrackingView.Briefing)}/*`);

  return involvesTracking && involvesBriefing;
}
