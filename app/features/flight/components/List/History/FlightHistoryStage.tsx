import React, { Suspense, useMemo } from "react";
import { twMerge } from "tailwind-merge";
import { MapSettingsProvider } from "~/app-state/useMapSettings";
import { useFlightHistoryStage } from "~/features/flight/hooks/useFlightHistoryStage";
import type { GlobeInsets } from "~/shared/lib/globeCamera";
import { MapAttribution } from "~/shared/ui/Map/MapAttribution";

const FlightHistoryGlobe = React.lazy(() =>
  import("~/features/flight/components/List/History/FlightHistoryGlobe").then((module) => ({
    default: module.FlightHistoryGlobe,
  })),
);

const PLACEHOLDER = "h-full w-full bg-gray-100 dark:bg-gray-950";
const ESTIMATED_FLIGHT_INSETS: GlobeInsets = { top: 290, bottom: 190 };

type Props = {
  parked: boolean;
};

export function FlightHistoryStage({ parked }: Props) {
  const {
    flights,
    status,
    tracks,
    hoveredId,
    setHoveredId,
    selectedId,
    open,
    handoff,
    returnCamera,
    rememberStageCamera,
    panelInset,
    flightInsets,
  } = useFlightHistoryStage();
  const overviewInsets = useMemo((): GlobeInsets => ({ top: 0, bottom: 0, left: panelInset }), [panelInset]);
  const hasFlights = status === "ready" && flights.length > 0;

  return (
    <div
      aria-hidden={parked || undefined}
      data-full-bleed={parked ? undefined : true}
      className={twMerge(
        "relative isolate h-72 overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 md:absolute md:inset-0 md:h-auto md:rounded-none md:border-0",
        parked && "invisible absolute inset-x-0 top-0",
      )}
    >
      {hasFlights ? (
        <Suspense fallback={<div className={PLACEHOLDER} />}>
          <FlightHistoryGlobe
            flights={flights}
            tracks={tracks}
            hoveredId={hoveredId}
            selectedId={selectedId ?? handoff?.flightId ?? null}
            overviewInsets={overviewInsets}
            flightInsets={flightInsets ?? ESTIMATED_FLIGHT_INSETS}
            entryCamera={returnCamera}
            onHover={setHoveredId}
            onOpen={(flightId) => {
              const flight = flights.find((candidate) => candidate.id === flightId);
              if (flight !== undefined) open(flight);
            }}
            onCameraChange={rememberStageCamera}
          />
        </Suspense>
      ) : (
        <div className={twMerge(PLACEHOLDER, status === "loading" && "animate-pulse")} />
      )}
      <MapSettingsProvider>
        <MapAttribution className="md:bottom-2 md:right-2" />
      </MapSettingsProvider>
    </div>
  );
}
