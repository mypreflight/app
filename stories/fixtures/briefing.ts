import { fn } from "storybook/test";
import type { AirportWeatherReport } from "~/features/airport";
import { type Flight, FlightStatus, type ManifestPassenger } from "~/features/flight";
import type { TrackedFlightContextType } from "~/features/flight/hooks/useTrackedFlight";
import type { TrackingViewState } from "~/features/flight/hooks/useTrackingView";
import type { BriefingDocument, BriefingPhase } from "~/features/flight/lib/briefingPhase";
import { oceanicFixes } from "~/features/flight/lib/briefingPhase";
import { latestLoadsheets, parseFlightLoadsheet } from "~/features/flight/lib/loadsheets";
import { TrackingView, trackFlightPath } from "~/features/flight/lib/trackingView";
import type { ApiFlightLoadsheetResponse } from "~/features/flight/request";
import type { RouteBriefingState } from "~/features/route/hooks/useRouteBriefing";
import type { EtopsBriefing } from "~/features/route/model";
import type { Runway } from "~/features/runway";
import type { ServiceStubs } from "../support/api";
import { flightFixture, trackedFlight } from "./flights";
import assignments from "./frankfurt-departure-assignments.json";
import briefing from "./frankfurt-new-york-nat-briefing.json";
import loadsheets from "./frankfurt-new-york-nat-loadsheets.json";
import manifest from "./frankfurt-new-york-nat-manifest.json";
import runways from "./frankfurt-runways.json";
import weather from "./frankfurt-weather.json";
import { routeBriefingState } from "./routes";

export const natBriefing = briefing as unknown as EtopsBriefing;
export const natManifest = manifest as unknown as ManifestPassenger[];
export const frankfurtWeather = weather as unknown as AirportWeatherReport[];
export const frankfurtRunways = runways as unknown as Runway[];
export const natLoadsheets = latestLoadsheets(
  (loadsheets as unknown as ApiFlightLoadsheetResponse[]).map(parseFlightLoadsheet),
);

const REPORTED_ON_BOARD = [35_050, 32_310, 27_780, 23_580, 19_550, 18_160];
const MINUTE = 60_000;

export function natFlight(status = FlightStatus.InCruise): Flight {
  return flightFixture({ route: "nat", status });
}

export function takeoffOf(flight: Flight): Date {
  return flight.timesheet.actual?.takeoffTime ?? flight.timesheet.scheduled.takeoffTime;
}

export function natBriefingWithReports(takeoffTime: Date, count: number): EtopsBriefing {
  const copy = structuredClone(natBriefing);
  const reported = oceanicFixes(copy.route.fixes, copy.oceanicCrossing).slice(0, count);

  reported.forEach((fix, index) => {
    fix.fuelReport = {
      actualOnBoard: REPORTED_ON_BOARD[index],
      reportedAt: new Date(takeoffTime.getTime() + fix.elapsedSeconds * 1000 + MINUTE).toISOString(),
    };
  });

  return copy;
}

export function natRouteState(flight: Flight, reports = 0): RouteBriefingState {
  const takeoffTime = flight.status === FlightStatus.InCruise ? takeoffOf(flight) : null;
  const plan = takeoffTime === null ? natBriefing : natBriefingWithReports(takeoffTime, reports);

  return {
    ...routeBriefingState(plan),
    takeoffTime,
    canReportFuel: flight.status === FlightStatus.InCruise,
    reportFixFuel: fn(async () => {}),
  };
}

export function natTrackedFlight(flight: Flight): TrackedFlightContextType {
  return { ...trackedFlight(flight), loadsheets: natLoadsheets };
}

export function briefingView(
  flight: Flight,
  phase: BriefingPhase | null = null,
  document: BriefingDocument | null = null,
): TrackingViewState {
  return {
    view: TrackingView.Briefing,
    phase,
    document,
    pathTo: (view) => trackFlightPath(flight.id, view, phase),
  };
}

export function trackingMapView(flight: Flight, document: BriefingDocument | null = null): TrackingViewState {
  return {
    view: TrackingView.Tracking,
    phase: null,
    document,
    pathTo: (view) => trackFlightPath(flight.id, view),
  };
}

export const natApi: ServiceStubs = {
  airportService: {
    fetchWeather: async (airportId: string) => (airportId === natFlight().departureAirport.id ? frankfurtWeather : []),
  },
  flightService: {
    fetchManifestByFlightId: async (flightId: string) => ({
      flightId,
      cabinLayout: "lh-74h",
      cabinLayoutRevision: 1,
      passengerCount: natManifest.length,
      passengersByCabin: {},
      passengers: natManifest,
    }),
    fetchCrewByFlightId: async () => [],
  },
  runwayService: {
    fetchById: async () => assignments.runway as never,
    fetchAll: async (airportId: string) =>
      (airportId === natFlight().departureAirport.id ? frankfurtRunways : []) as never,
  },
  parkingPositionService: {
    fetchById: async () => assignments.parkingPosition as never,
  },
  terminalService: {
    fetchAll: async () => assignments.terminals as never,
  },
};
