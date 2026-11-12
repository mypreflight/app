import { useThemeMode } from "flowbite-react";
import { useMemo, useState } from "react";
import type { Flight } from "~/features/flight";
import { airportGlobeMarkers } from "~/features/flight/components/Map/Globe/globeMarkers";
import {
  HISTORY_HIT_LAYER,
  type HistoryTrack,
  historyActiveSources,
  historyFlightPoints,
  historyOverviewOverlay,
  historyOverviewPoints,
  historyOverviewSources,
} from "~/features/flight/lib/historyOverview";
import type { GlobeInsets } from "~/shared/lib/globeCamera";
import {
  type GlobeCameraState,
  type GlobeCameraTarget,
  type GlobeEntryCamera,
  GlobeMap,
  type GlobeMarker,
} from "~/shared/ui/Globe/GlobeMap";

type Props = {
  flights: Flight[];
  tracks: ReadonlyMap<string, HistoryTrack>;
  hoveredId: string | null;
  selectedId: string | null;
  overviewInsets: GlobeInsets;
  flightInsets: GlobeInsets;
  entryCamera: GlobeEntryCamera | null;
  onHover: (flightId: string | null) => void;
  onOpen: (flightId: string) => void;
  onCameraChange: (camera: GlobeCameraState) => void;
};

const OVERVIEW_FLIGHTS = 10;

function flightIdOf(properties: Record<string, unknown> | null): string | null {
  return typeof properties?.id === "string" ? properties.id : null;
}

export function FlightHistoryGlobe({
  flights,
  tracks,
  hoveredId,
  selectedId,
  overviewInsets,
  flightInsets,
  entryCamera,
  onHover,
  onOpen,
  onCameraChange,
}: Props) {
  const { computedMode } = useThemeMode();
  const theme = computedMode === "dark" ? "dark" : "light";
  const activeId = selectedId ?? hoveredId;
  const active = flights.find((flight) => flight.id === activeId) ?? null;

  const sources = useMemo(() => historyOverviewSources(flights, tracks), [flights, tracks]);
  const activeTrack = activeId === null ? undefined : tracks.get(activeId);
  const activeSources = useMemo(() => historyActiveSources(activeTrack), [activeTrack]);
  const receded = selectedId !== null;
  const overlay = useMemo(
    () => historyOverviewOverlay({ sources, activeSources, receded, theme }),
    [sources, activeSources, receded, theme],
  );

  const [overview] = useState(
    (): GlobeCameraTarget => ({
      key: "history-overview",
      kind: "fit",
      points: historyOverviewPoints(flights.slice(0, OVERVIEW_FLIGHTS)),
    }),
  );
  const selected = flights.find((flight) => flight.id === selectedId) ?? null;
  const selectedTrack = selectedId === null ? undefined : tracks.get(selectedId);
  const target = useMemo(
    (): GlobeCameraTarget =>
      selected === null
        ? overview
        : { key: `history-flight-${selected.id}`, kind: "fit", points: historyFlightPoints(selected, selectedTrack) },
    [overview, selected, selectedTrack],
  );

  const markers = useMemo(
    (): GlobeMarker[] =>
      active === null
        ? []
        : [...airportGlobeMarkers(active.departureAirport), ...airportGlobeMarkers(active.destinationAirport)],
    [active],
  );

  return (
    <GlobeMap
      overlay={overlay}
      target={target}
      insets={selected === null ? overviewInsets : flightInsets}
      markers={markers}
      clickableLayer={HISTORY_HIT_LAYER}
      onFeatureHover={(properties) => onHover(flightIdOf(properties))}
      onFeatureClick={(properties) => {
        const flightId = flightIdOf(properties);
        if (flightId !== null) onOpen(flightId);
      }}
      entryCamera={entryCamera}
      onCameraChange={onCameraChange}
    />
  );
}
