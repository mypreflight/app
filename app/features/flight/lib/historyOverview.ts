import type { LatLngTuple } from "leaflet";
import type { Airport } from "~/features/airport";
import type { Flight, FlightPathElement } from "~/features/flight";
import { airportRoute } from "~/features/flight/lib/flightMapBounds";
import { unwrapAcrossAntimeridian } from "~/shared/lib/antimeridian";
import { type GlobeLine, type GlobeOverlay, lineSource, pointSource } from "~/shared/lib/globeStyle";

export type HistoryTrack = { kind: "flown"; path: LatLngTuple[] } | { kind: "planned"; path: LatLngTuple[] };

export type HistoryTracks = ReadonlyMap<string, HistoryTrack>;

export type HistoryOverviewTheme = "light" | "dark";

export const HISTORY_HIT_LAYER = "history-hit";

const MIN_STEP_DEGREES = 0.04;
const PALETTE = {
  light: { line: "#6b7280", lineOpacity: 0.6, active: "#4f46e5", dot: "#6b7280", halo: "#ffffff" },
  dark: { line: "#9ca3af", lineOpacity: 0.5, active: "#818cf8", dot: "#9ca3af", halo: "#111827" },
} as const;
const RECEDED_OPACITY = 0.18;

function airportPosition(airport: Airport): LatLngTuple {
  return [airport.location.latitude, airport.location.longitude];
}

export function thinTrack(path: FlightPathElement[]): LatLngTuple[] {
  const kept: LatLngTuple[] = [];

  for (const point of path) {
    const position: LatLngTuple = [point.latitude, point.longitude];
    const last = kept.at(-1);

    if (last === undefined) {
      kept.push(position);
      continue;
    }

    const latitudeStep = position[0] - last[0];
    const longitudeStep = (position[1] - last[1]) * Math.cos((last[0] * Math.PI) / 180);

    if (Math.hypot(latitudeStep, longitudeStep) >= MIN_STEP_DEGREES) {
      kept.push(position);
    }
  }

  const final = path.at(-1);
  if (final !== undefined && kept.length > 1) {
    kept[kept.length - 1] = [final.latitude, final.longitude];
  }

  return unwrapAcrossAntimeridian(kept);
}

export function historyTrack(flight: Flight, path: FlightPathElement[] | null): HistoryTrack {
  const flown = path === null ? [] : thinTrack(path);

  if (flown.length > 1) {
    return { kind: "flown", path: flown };
  }

  return { kind: "planned", path: airportRoute(flight.departureAirport, flight.destinationAirport) };
}

function linesOf(tracks: HistoryTracks, kind: HistoryTrack["kind"]): GlobeLine[] {
  return [...tracks]
    .filter(([, track]) => track.kind === kind)
    .map(([id, track]) => ({ path: track.path, properties: { id } }));
}

function airportsOf(flights: Flight[]): Airport[] {
  const airports = new Map<string, Airport>();

  for (const flight of flights) {
    airports.set(flight.departureAirport.id, flight.departureAirport);
    airports.set(flight.destinationAirport.id, flight.destinationAirport);
  }

  return [...airports.values()];
}

export type HistoryOverviewSources = GlobeOverlay["sources"];

export function historyOverviewSources(flights: Flight[], tracks: HistoryTracks): HistoryOverviewSources {
  return {
    "history-flown": lineSource(linesOf(tracks, "flown")),
    "history-planned": lineSource(linesOf(tracks, "planned")),
    "history-airports": pointSource(airportsOf(flights).map((airport) => ({ position: airportPosition(airport) }))),
    [HISTORY_HIT_LAYER]: lineSource([...linesOf(tracks, "flown"), ...linesOf(tracks, "planned")]),
  };
}

export function historyActiveSources(track: HistoryTrack | undefined): HistoryOverviewSources {
  return {
    "history-active-flown": lineSource(track?.kind === "flown" ? [{ path: track.path }] : []),
    "history-active-planned": lineSource(track?.kind === "planned" ? [{ path: track.path }] : []),
  };
}

type OverviewOptions = {
  sources: HistoryOverviewSources;
  activeSources: HistoryOverviewSources;
  receded: boolean;
  theme: HistoryOverviewTheme;
};

export function historyOverviewOverlay({ sources, activeSources, receded, theme }: OverviewOptions): GlobeOverlay {
  const palette = PALETTE[theme];
  const lineOpacity = receded ? RECEDED_OPACITY : palette.lineOpacity;

  return {
    sources: { ...sources, ...activeSources },
    layers: [
      {
        id: "history-flown",
        type: "line",
        source: "history-flown",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": palette.line, "line-width": 1.75, "line-opacity": lineOpacity },
      },
      {
        id: "history-planned",
        type: "line",
        source: "history-planned",
        paint: {
          "line-color": palette.line,
          "line-width": 1.5,
          "line-opacity": lineOpacity,
          "line-dasharray": [3, 3],
        },
      },
      {
        id: "history-airports",
        type: "circle",
        source: "history-airports",
        paint: {
          "circle-radius": 2.5,
          "circle-color": palette.dot,
          "circle-opacity": receded ? RECEDED_OPACITY : 0.9,
          "circle-stroke-color": palette.halo,
          "circle-stroke-width": 1,
          "circle-stroke-opacity": receded ? RECEDED_OPACITY : 0.9,
        },
      },
      {
        id: HISTORY_HIT_LAYER,
        type: "line",
        source: HISTORY_HIT_LAYER,
        paint: { "line-color": palette.line, "line-width": 14, "line-opacity": 0 },
      },
      {
        id: "history-active-planned",
        type: "line",
        source: "history-active-planned",
        paint: { "line-color": palette.active, "line-width": 3, "line-dasharray": [2, 2] },
      },
      {
        id: "history-active-flown",
        type: "line",
        source: "history-active-flown",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": palette.active, "line-width": 3 },
      },
    ],
  };
}

export function historyOverviewPoints(flights: Flight[]): LatLngTuple[] {
  return airportsOf(flights).map(airportPosition);
}

export function historyFlightPoints(flight: Flight, track: HistoryTrack | undefined): LatLngTuple[] {
  const lastPoint = track?.kind === "flown" ? track.path.at(-1) : undefined;

  return [
    airportPosition(flight.departureAirport),
    airportPosition(flight.destinationAirport),
    ...(lastPoint === undefined ? [] : [lastPoint]),
  ];
}
