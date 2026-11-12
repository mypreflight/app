import React, { type Ref, Suspense, useCallback, useMemo, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { type MapIntent, MapSettingsProvider } from "~/app-state/useMapSettings";
import { useAdsbData } from "~/features/adsb/hooks/useAdsbData";
import { Tracking } from "~/features/flight";
import { FlightRouteMap } from "~/features/flight/components/Map/Box/FlightRouteMap";
import { LiveTelemetry } from "~/features/flight/components/Map/Box/Overlay/LiveTelemetry";
import { MapFixCard } from "~/features/flight/components/Map/Box/Overlay/MapFixCard";
import { MapOptionsControl } from "~/features/flight/components/Map/Box/Overlay/MapOptionsControl";
import { MapShareLinks } from "~/features/flight/components/Map/Box/Overlay/MapShareLinks";
import { useMapProjection } from "~/features/flight/hooks/useMapProjection";
import { useTrackedFlight } from "~/features/flight/hooks/useTrackedFlight";
import { usePlannedRoute } from "~/features/route/hooks/useRouteBriefing";
import { hasEtopsRings, hasFiledWaypoints } from "~/shared/lib/flightData";
import type { MapCameraView } from "~/shared/lib/mapCameraView";
import type { MapFocus } from "~/shared/lib/mapFocus";
import type { ContainerClassProps } from "~/shared/ui/Layout/Container";

const FlightRouteGlobeMap = React.lazy(() =>
  import("~/features/flight/components/Map/Box/FlightRouteGlobeMap").then((module) => ({
    default: module.FlightRouteGlobeMap,
  })),
);

const BOTTOM_BAR_HEIGHT = 88;

type MapBoxProps = ContainerClassProps & {
  ref?: Ref<HTMLDivElement>;
  mapIntent: MapIntent;
  topInset: number;
};

export function MapBox({ ref, className, mapIntent, topInset }: MapBoxProps) {
  const { flight, diversion } = useTrackedFlight();
  const { flightPath } = useAdsbData();
  const plannedRoute = usePlannedRoute();
  const [projection, setProjection] = useMapProjection("map-projection.tracking");
  const isGlobe = projection === "globe";
  const view = useRef<MapCameraView | null>(null);
  const rememberView = useCallback((next: MapCameraView) => {
    view.current = next;
  }, []);
  const [isFixCardOpen, setIsFixCardOpen] = useState(false);
  const [fixFocus, setFixFocus] = useState<MapFocus | null>(null);
  const insets = useMemo(() => ({ top: topInset, bottom: BOTTOM_BAR_HEIGHT }), [topInset]);
  const selectFix = plannedRoute?.select;
  const openFixCard = useCallback(
    (ordinal: number) => {
      selectFix?.(ordinal);
      setIsFixCardOpen(true);
    },
    [selectFix],
  );

  if (!flight) {
    return null;
  }

  const lastPoint = flightPath[flightPath.length - 1];
  const canShare = flight.tracking !== Tracking.Disabled;

  return (
    <div ref={ref} className={twMerge("relative", className)}>
      <MapSettingsProvider intent={mapIntent}>
        {isGlobe ? (
          <Suspense fallback={<div className="h-full w-full animate-pulse bg-gray-100 dark:bg-gray-900" />}>
            <FlightRouteGlobeMap
              flight={flight}
              diversion={diversion}
              flightPath={flightPath}
              insets={insets}
              initialView={view.current}
              onViewChange={rememberView}
              onFixClick={openFixCard}
              focus={fixFocus}
            />
          </Suspense>
        ) : (
          <FlightRouteMap
            flight={flight}
            diversion={diversion}
            flightPath={flightPath}
            insets={insets}
            initialView={view.current}
            onViewChange={rememberView}
            onFixClick={openFixCard}
            focus={fixFocus}
          />
        )}
        <MapFixCard
          isOpen={isFixCardOpen}
          topInset={topInset}
          bottomInset={BOTTOM_BAR_HEIGHT}
          onClose={() => setIsFixCardOpen(false)}
          onFocus={setFixFocus}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-3 z-20 md:bottom-6">
          <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-2 px-3 md:px-6">
            <div className="pointer-events-auto flex items-center gap-2">
              <MapOptionsControl
                size="sm"
                triggerClassName="relative"
                projection={projection}
                onProjectionChange={setProjection}
                hasFiledRoute={hasFiledWaypoints(plannedRoute?.briefing)}
                hasEtopsRings={hasEtopsRings(plannedRoute?.briefing)}
              />
            </div>
            {(lastPoint || canShare) && (
              <div className="pointer-events-auto flex flex-wrap items-center justify-end gap-x-3 gap-y-2 rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-900">
                <LiveTelemetry point={lastPoint} />
                {canShare && <MapShareLinks flightId={flight.id} />}
              </div>
            )}
          </div>
        </div>
      </MapSettingsProvider>
    </div>
  );
}
