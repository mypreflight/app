import type { LatLngTuple } from "leaflet";
import { fn } from "storybook/test";
import {
  Flight,
  type FlightEvent,
  FlightEventScope,
  FlightEventType,
  type FlightPathElement,
  type FlightServiceType,
  FlightStatus,
} from "~/features/flight";
import type { TrackedFlightContextType } from "~/features/flight/hooks/useTrackedFlight";
import { airportRoute } from "~/features/flight/lib/flightMapBounds";
import type { ApiFlightResponse } from "~/features/flight/request";
import type { GsxSettingsResponse } from "~/features/user/request";
import { greatCirclePath } from "~/shared/lib/greatCircle";
import bostonPhiladelphia from "./boston-philadelphia.json";
import bostonPhiladelphiaTrack from "./boston-philadelphia-track.json";
import frankfurtNewYork from "./frankfurt-new-york.json";

export type RouteFixture = "short" | "longHaul" | "polar";

const [frankfurt, newYork, philadelphia] = frankfurtNewYork.airports;

const newYorkHongKong = {
  ...frankfurtNewYork,
  airports: [
    { ...newYork, type: "departure" },
    {
      ...frankfurt,
      id: "6f0f8a52-3f0e-4c8e-9d38-1f4b7a2c5e10",
      icaoCode: "VHHH",
      iataCode: "HKG",
      city: { ...frankfurt.city, name: "Hong Kong" },
      name: "Hong Kong Intl",
      country: { code: "HK", name: "Hong Kong" },
      timezone: "Asia/Hong_Kong",
      continent: "asia",
      location: { latitude: 22.30889, longitude: 113.91472 },
      shape: [],
      type: "destination",
    },
    philadelphia,
  ],
};

const ROUTES: Record<RouteFixture, unknown> = {
  short: bostonPhiladelphia,
  longHaul: frankfurtNewYork,
  polar: newYorkHongKong,
};

const BLOCK_EVENTS = ["offBlockTime", "takeoffTime", "arrivalTime", "onBlockTime"] as const;

const REPORTED_EVENTS: Partial<Record<FlightStatus, number>> = {
  [FlightStatus.TaxiingOut]: 1,
  [FlightStatus.InCruise]: 2,
  [FlightStatus.TaxiingIn]: 3,
  [FlightStatus.OnBlock]: 4,
  [FlightStatus.OffboardingStarted]: 4,
  [FlightStatus.OffboardingFinished]: 4,
  [FlightStatus.Closed]: 4,
};

export const CRUISE_FRACTION = 0.45;

const MINUTE = 60_000;

function minutesSinceOffBlock(status: FlightStatus, plan: number[]): number {
  switch (status) {
    case FlightStatus.BoardingStarted:
      return -20;
    case FlightStatus.BoardingFinished:
      return -3;
    case FlightStatus.TaxiingOut:
      return 6;
    case FlightStatus.InCruise:
      return plan[1] + (plan[2] - plan[1]) * CRUISE_FRACTION;
    case FlightStatus.TaxiingIn:
      return plan[2] + 3;
    case FlightStatus.OnBlock:
      return plan[3] + 2;
    case FlightStatus.OffboardingStarted:
      return plan[3] + 10;
    case FlightStatus.OffboardingFinished:
    case FlightStatus.Closed:
      return plan[3] + 25;
    default:
      return -50;
  }
}

export type FlightFixtureOptions = {
  route?: RouteFixture;
  status?: FlightStatus;
  serviceType?: FlightServiceType;
  delayMinutes?: number;
  blockDeltaMinutes?: number;
};

export function flightFixture({
  route = "short",
  status = FlightStatus.InCruise,
  serviceType,
  delayMinutes = 0,
  blockDeltaMinutes = 0,
}: FlightFixtureOptions = {}): Flight {
  const base = structuredClone(ROUTES[route]) as ApiFlightResponse;
  const scheduled = base.timesheet.scheduled;
  const offBlock = Date.parse(scheduled.offBlockTime);
  const plan = BLOCK_EVENTS.map((key) => (Date.parse(scheduled[key]) - offBlock) / MINUTE);

  const scheduledOffBlock = Date.now() - (minutesSinceOffBlock(status, plan) + delayMinutes) * MINUTE;
  const reported = REPORTED_EVENTS[status] ?? 0;
  const at = (index: number, shift: number) =>
    new Date(scheduledOffBlock + (plan[index] + shift) * MINUTE).toISOString();
  const expected = (index: number) => at(index, delayMinutes + (index >= 2 ? blockDeltaMinutes : 0));

  base.status = status;
  base.serviceType = serviceType ?? base.serviceType;
  base.timesheet = {
    scheduled: {
      offBlockTime: at(0, 0),
      takeoffTime: at(1, 0),
      arrivalTime: at(2, 0),
      onBlockTime: at(3, 0),
    },
    estimated: {
      offBlockTime: expected(0),
      takeoffTime: expected(1),
      arrivalTime: expected(2),
      onBlockTime: expected(3),
    },
    actual: {
      offBlockTime: reported > 0 ? expected(0) : null,
      takeoffTime: reported > 1 ? expected(1) : null,
      arrivalTime: reported > 2 ? expected(2) : null,
      onBlockTime: reported > 3 ? expected(3) : null,
    },
  };

  return new Flight(base);
}

export const recordedTrack = bostonPhiladelphiaTrack as FlightPathElement[];

export function syntheticTrack(flight: Flight, fraction: number, points = 40): FlightPathElement[] {
  const route = airportRoute(flight.departureAirport, flight.destinationAirport);
  const coords = Array.from(
    { length: points },
    (_, index) => route[Math.round((index * (route.length - 1)) / (points - 1))],
  );
  const flown = coords.slice(0, Math.max(2, Math.round(coords.length * fraction)));

  return flown.map(([latitude, longitude], index) => ({
    callsign: flight.callsign,
    date: new Date(Date.now() - (flown.length - index) * MINUTE).toISOString(),
    latitude,
    longitude,
    altitude: Math.min(36_000, index * 4_000),
    groundSpeed: 480,
    isOnGround: false,
  }));
}

const CLIMB_MINUTES = 26;
const DESCENT_MINUTES = 32;
const INITIAL_CRUISE = 35_000;
const FINAL_CRUISE = 37_000;

function between(from: number, to: number, fraction: number): number {
  return from + (to - from) * Math.min(Math.max(fraction, 0), 1);
}

function initialBearing([fromLatitude, fromLongitude]: LatLngTuple, [toLatitude, toLongitude]: LatLngTuple): number {
  const radians = Math.PI / 180;
  const deltaLongitude = (toLongitude - fromLongitude) * radians;
  const y = Math.sin(deltaLongitude) * Math.cos(toLatitude * radians);
  const x =
    Math.cos(fromLatitude * radians) * Math.sin(toLatitude * radians) -
    Math.sin(fromLatitude * radians) * Math.cos(toLatitude * radians) * Math.cos(deltaLongitude);

  return (((Math.atan2(y, x) / radians) % 360) + 360) % 360;
}

function groundPoint(flight: Flight, [latitude, longitude]: LatLngTuple, at: Date): FlightPathElement {
  return {
    callsign: flight.callsign,
    date: at.toISOString(),
    latitude,
    longitude,
    altitude: 0,
    groundSpeed: 14,
    isOnGround: true,
  };
}

export function flownTrack(flight: Flight, waypoints?: LatLngTuple[], points = 180): FlightPathElement[] {
  const { actual } = flight.timesheet;
  const takeoff = actual?.takeoffTime?.getTime();
  const arrival = actual?.arrivalTime?.getTime();

  if (takeoff === undefined || arrival === undefined || !actual?.offBlockTime || !actual.onBlockTime) {
    return [];
  }

  const route =
    waypoints === undefined
      ? airportRoute(flight.departureAirport, flight.destinationAirport)
      : greatCirclePath(waypoints);
  const total = (arrival - takeoff) / MINUTE;
  const stepAt = total * 0.55;
  const descentAt = total - DESCENT_MINUTES;

  const positionAt = (fraction: number) => route[Math.round(Math.min(Math.max(fraction, 0), 1) * (route.length - 1))];

  const airborne = Array.from({ length: points }, (_, index): FlightPathElement => {
    const fraction = index / (points - 1);
    const minutes = fraction * total;
    const [latitude, longitude] = positionAt(fraction);
    const [nextLatitude, nextLongitude] = positionAt(fraction + 1 / points);
    const climbing = minutes < CLIMB_MINUTES;
    const descending = minutes > descentAt;
    const cruise = minutes < stepAt ? INITIAL_CRUISE : FINAL_CRUISE;

    return {
      callsign: flight.callsign,
      date: new Date(takeoff + minutes * MINUTE).toISOString(),
      latitude,
      longitude,
      altitude: Math.round(
        climbing
          ? between(800, INITIAL_CRUISE, minutes / CLIMB_MINUTES)
          : descending
            ? between(FINAL_CRUISE, 600, (minutes - descentAt) / DESCENT_MINUTES)
            : cruise,
      ),
      groundSpeed: Math.round(
        climbing
          ? between(165, 455, minutes / CLIMB_MINUTES)
          : descending
            ? between(455, 145, (minutes - descentAt) / DESCENT_MINUTES)
            : 478 + 22 * Math.sin(fraction * 11),
      ),
      verticalRate: climbing ? 2_400 : descending ? -1_900 : 0,
      track: Math.round(initialBearing([latitude, longitude], [nextLatitude, nextLongitude])),
      isOnGround: false,
    };
  });

  return [
    groundPoint(flight, route[0], actual.offBlockTime),
    ...airborne,
    groundPoint(flight, route[route.length - 1], actual.onBlockTime),
  ];
}

export function livePositionEvents(): FlightEvent[] {
  return [
    {
      id: "live-position",
      scope: FlightEventScope.System,
      type: FlightEventType.LivePositionReceived,
      payload: {},
      actor: null,
      createdAt: new Date(Date.now() - 30 * MINUTE),
    },
  ];
}

export function trackedFlight(
  flight: Flight,
  events: FlightEvent[] = [],
  gsxSettings: GsxSettingsResponse | null = null,
): TrackedFlightContextType {
  return {
    flight,
    loadsheets: { preliminary: null, final: null },
    events,
    emergencies: [],
    emergenciesLoadFailed: false,
    activeEmergency: null,
    diversion: null,
    delayRequest: null,
    gsxSettings,
    loading: false,
    connectionStatus: "live",
    setFlightId: fn(),
    reconnect: fn(),
    reload: fn(async () => {}),
    checkIn: fn(async () => {}),
    reportPredictedTimes: fn(async () => {}),
    startBoarding: fn(async () => {}),
    finishBoarding: fn(async () => {}),
    reportOffBlock: fn(async () => {}),
    reportTakeoff: fn(async () => {}),
    reportArrival: fn(async () => {}),
    reportOnBlock: fn(async () => {}),
    startOffboarding: fn(async () => {}),
    finishOffboarding: fn(async () => {}),
    close: fn(async () => {}),
    declareEmergency: fn(async () => {}),
    updateEmergency: fn(async () => {}),
    resolveEmergency: fn(async () => {}),
    reportDiversion: fn(async () => {}),
    updateDiversion: fn(async () => {}),
    fileDelayReport: fn(async () => {}),
    removeDelayReport: fn(async () => {}),
    acceptDelayReport: fn(async () => {}),
    rejectDelayReport: fn(async () => {}),
  };
}
