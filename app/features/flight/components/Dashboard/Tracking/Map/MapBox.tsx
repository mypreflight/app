import React, { type Ref, Suspense, useCallback, useMemo, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { type MapIntent, MapSettingsProvider } from "~/app-state/useMapSettings";
import { useAdsbData } from "~/features/adsb/hooks/useAdsbData";
import { type FlightPathElement, Tracking } from "~/features/flight";
import { FlightRouteMap } from "~/features/flight/components/Map/Box/FlightRouteMap";
import { LiveTelemetry } from "~/features/flight/components/Map/Box/Overlay/LiveTelemetry";
import { MapFixCard } from "~/features/flight/components/Map/Box/Overlay/MapFixCard";
import { MapOptionsControl } from "~/features/flight/components/Map/Box/Overlay/MapOptionsControl";
import { MapShareLinks } from "~/features/flight/components/Map/Box/Overlay/MapShareLinks";
import { FlightProfilePanel } from "~/features/flight/components/Profile/FlightProfilePanel";
import { ProfileReadout } from "~/features/flight/components/Profile/ProfileReadout";
import { useMapProjection } from "~/features/flight/hooks/useMapProjection";
import { useTrackedFlight } from "~/features/flight/hooks/useTrackedFlight";
import { resolveBlockTime } from "~/features/flight/lib/blockEvents";
import { plannedProfile } from "~/features/flight/lib/verticalProfile";
import { usePlannedRoute } from "~/features/route/hooks/useRouteBriefing";
import { useCoveredHeight } from "~/shared/hooks/useCoveredHeight";
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

function hasFlownTrack(path: FlightPathElement[]): boolean {
  return path.length > 1 && path.some((point) => !point.isOnGround && (point.altitude ?? 0) > 0);
}

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
  const [cursorIndex, setCursorIndex] = useState<number | null>(null);
  const fixes = plannedRoute?.briefing?.route.fixes;
  const timesheet = flight?.timesheet;
  const planned = useMemo(
    () => (timesheet === undefined ? [] : plannedProfile(fixes ?? [], resolveBlockTime("takeoffTime", timesheet).time)),
    [fixes, timesheet],
  );
  const hasProfile = planned.length > 1 || hasFlownTrack(flightPath);
  const strip = useCoveredHeight<HTMLDivElement, HTMLDivElement>(hasProfile);
  const bottomInset = hasProfile ? strip.coveredHeight : BOTTOM_BAR_HEIGHT;
  const insets = useMemo(() => ({ top: topInset, bottom: bottomInset }), [topInset, bottomInset]);
  const aircraftPath = useMemo(
    () => (cursorIndex === null ? flightPath : flightPath.slice(0, cursorIndex + 1)),
    [flightPath, cursorIndex],
  );
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
  const mapOptions = (
    <MapOptionsControl
      size="sm"
      triggerClassName="relative"
      projection={projection}
      onProjectionChange={setProjection}
      hasFiledRoute={hasFiledWaypoints(plannedRoute?.briefing)}
      hasEtopsRings={hasEtopsRings(plannedRoute?.briefing)}
    />
  );
  const mapProps = {
    flight,
    diversion,
    flightPath,
    aircraftPath,
    insets,
    initialView: view.current,
    onViewChange: rememberView,
    onFixClick: openFixCard,
    focus: fixFocus,
  };

  return (
    <div ref={ref} className={twMerge("relative flex flex-col gap-3", className)}>
      <MapSettingsProvider intent={mapIntent}>
        <div
          ref={strip.coverRef}
          className="relative h-[clamp(24rem,70dvh,48rem)] overflow-hidden rounded-2xl border border-gray-200 md:h-full md:rounded-none md:border-0 dark:border-gray-800"
        >
          {isGlobe ? (
            <Suspense fallback={<div className="h-full w-full animate-pulse bg-gray-100 dark:bg-gray-900" />}>
              <FlightRouteGlobeMap {...mapProps} />
            </Suspense>
          ) : (
            <FlightRouteMap {...mapProps} />
          )}
          <MapFixCard
            isOpen={isFixCardOpen}
            topInset={topInset}
            bottomInset={bottomInset}
            onClose={() => setIsFixCardOpen(false)}
            onFocus={setFixFocus}
          />
          {!hasProfile && (
            <div className="pointer-events-none absolute inset-x-0 bottom-3 z-20 md:bottom-6">
              <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-2 px-3 md:px-6">
                <div className="pointer-events-auto flex items-center gap-2">{mapOptions}</div>
                {(lastPoint || canShare) && (
                  <div className="pointer-events-auto flex flex-wrap items-center justify-end gap-x-3 gap-y-2 rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-900">
                    <LiveTelemetry point={lastPoint} />
                    {canShare && <MapShareLinks flightId={flight.id} />}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {hasProfile && (
          <div
            ref={strip.targetRef}
            className="z-20 md:pointer-events-none md:absolute md:inset-x-0 md:bottom-0 md:pb-6"
          >
            <div className="md:mx-auto md:max-w-7xl md:px-6">
              <FlightProfilePanel
                controls={mapOptions}
                readout={
                  <ProfileReadout
                    path={flightPath}
                    point={cursorIndex === null ? null : (flightPath[cursorIndex] ?? null)}
                    idle="latest"
                  />
                }
                actions={canShare && <MapShareLinks flightId={flight.id} />}
                path={flightPath}
                timesheet={flight.timesheet}
                planned={planned}
                cursorIndex={cursorIndex}
                onCursorChange={setCursorIndex}
              />
            </div>
          </div>
        )}
      </MapSettingsProvider>
    </div>
  );
}
