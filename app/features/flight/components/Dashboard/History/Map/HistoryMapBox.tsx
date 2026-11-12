import React, { type Ref, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HiInformationCircle } from "react-icons/hi";
import { twMerge } from "tailwind-merge";
import { MapSettingsProvider } from "~/app-state/useMapSettings";
import { Tracking } from "~/features/flight";
import { ProfileReadout } from "~/features/flight/components/Dashboard/History/Map/ProfileReadout";
import { FlightRouteMap } from "~/features/flight/components/Map/Box/FlightRouteMap";
import { MapFixCard } from "~/features/flight/components/Map/Box/Overlay/MapFixCard";
import { MapOptionsControl } from "~/features/flight/components/Map/Box/Overlay/MapOptionsControl";
import { MapShareLinks } from "~/features/flight/components/Map/Box/Overlay/MapShareLinks";
import { VerticalProfile } from "~/features/flight/components/Profile/VerticalProfile";
import { useFlightHistoryEntry } from "~/features/flight/hooks/useFlightHistoryStage";
import { useHistoryFlight } from "~/features/flight/hooks/useHistoryFlight";
import { useMapProjection } from "~/features/flight/hooks/useMapProjection";
import { HISTORY_MAP_INTENT } from "~/features/flight/lib/historyView";
import { plannedProfile } from "~/features/flight/lib/verticalProfile";
import { usePlannedRoute } from "~/features/route/hooks/useRouteBriefing";
import { useCoveredHeight } from "~/shared/hooks/useCoveredHeight";
import { hasEtopsRings, hasFiledWaypoints } from "~/shared/lib/flightData";
import type { MapCameraView } from "~/shared/lib/mapCameraView";
import type { MapFocus } from "~/shared/lib/mapFocus";
import { FieldLabel } from "~/shared/ui/Display/FieldLabel";
import { GLOBE_GLIDE_MS } from "~/shared/ui/Globe/GlobeMap";

const REVEAL_MS = 220;
const REVEAL_FALLBACK_MS = 2500;

const loadFlightRouteGlobeMap = () => import("~/features/flight/components/Map/Box/FlightRouteGlobeMap");
const FlightRouteGlobeMap = React.lazy(() =>
  loadFlightRouteGlobeMap().then((module) => ({ default: module.FlightRouteGlobeMap })),
);

type Props = {
  ref?: Ref<HTMLDivElement>;
  className?: string;
  topInset: number;
};

function ProfileNotice({ children }: { children: string }) {
  return (
    <p className="mt-2 flex items-center gap-2 rounded-xl border border-dashed border-gray-300 px-3 py-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
      <HiInformationCircle className="size-4 shrink-0" aria-hidden={true} />
      {children}
    </p>
  );
}

function Legend({ hasPlan }: { hasPlan: boolean }) {
  return (
    <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600 dark:text-gray-300">
      <span className="flex items-center gap-1.5">
        <span aria-hidden={true} className="h-0.5 w-3.5 rounded-full bg-indigo-500 dark:bg-indigo-400" />
        Altitude
      </span>
      <span className="flex items-center gap-1.5">
        <span aria-hidden={true} className="h-0.5 w-3.5 rounded-full bg-gray-500 dark:bg-gray-400" />
        Ground speed
      </span>
      {hasPlan && (
        <span className="flex items-center gap-1.5">
          <span
            aria-hidden={true}
            className="w-3.5 border-t-2 border-dashed border-indigo-400 dark:border-indigo-300"
          />
          Planned altitude
        </span>
      )}
    </span>
  );
}

export function HistoryMapBox({ ref, className, topInset }: Props) {
  const { flight, diversion, flightPath, pathLoadFailed } = useHistoryFlight();
  const plannedRoute = usePlannedRoute();
  const [projection, setProjection] = useMapProjection("map-projection.history");
  const strip = useCoveredHeight<HTMLDivElement, HTMLDivElement>(true);
  const view = useRef<MapCameraView | null>(null);
  const rememberView = useCallback((next: MapCameraView) => {
    view.current = next;
  }, []);
  const [cursorIndex, setCursorIndex] = useState<number | null>(null);
  const [isFixCardOpen, setIsFixCardOpen] = useState(false);
  const [fixFocus, setFixFocus] = useState<MapFocus | null>(null);
  const selectFix = plannedRoute?.select;
  const openFixCard = useCallback(
    (ordinal: number) => {
      selectFix?.(ordinal);
      setIsFixCardOpen(true);
    },
    [selectFix],
  );
  const insets = useMemo(() => ({ top: topInset, bottom: strip.coveredHeight }), [topInset, strip.coveredHeight]);
  const fixes = plannedRoute?.briefing?.route.fixes;
  const takeoff = flight?.timesheet.actual?.takeoffTime ?? flight?.timesheet.scheduled.takeoffTime;
  const planned = useMemo(() => plannedProfile(fixes ?? [], takeoff), [fixes, takeoff]);
  const aircraftPath = useMemo(
    () => (cursorIndex === null ? flightPath : flightPath.slice(0, cursorIndex + 1)),
    [flightPath, cursorIndex],
  );
  const entry = useFlightHistoryEntry();
  const isGlobe = projection === "globe";
  const handoff = entry?.handoff ?? null;
  const [handoffCamera, setHandoffCamera] = useState(() =>
    handoff !== null && handoff.flightId === flight?.id ? handoff.camera : null,
  );
  const [isRevealed, setIsRevealed] = useState(handoffCamera === null || !isGlobe);
  const [isEntering] = useState(handoffCamera !== null);
  const [isGlobeDeferred, setIsGlobeDeferred] = useState(handoffCamera !== null && isGlobe);
  const completeHandoff = entry?.completeHandoff;
  const flightId = flight?.id;
  const reveal = useCallback(() => {
    setIsRevealed(true);
    setHandoffCamera(null);
    if (flightId !== undefined) window.setTimeout(() => completeHandoff?.(flightId), REVEAL_MS);
  }, [completeHandoff, flightId]);

  const reportFlightInsets = entry?.reportFlightInsets;
  useEffect(() => {
    if (insets.top > 0) reportFlightInsets?.(insets);
  }, [insets, reportFlightInsets]);

  const handoffStartedAt = handoff?.startedAt;
  useEffect(() => {
    if (!isGlobeDeferred) return;

    void loadFlightRouteGlobeMap();
    const remaining = handoffStartedAt === undefined ? 0 : handoffStartedAt + GLOBE_GLIDE_MS - performance.now();
    const timer = window.setTimeout(() => setIsGlobeDeferred(false), Math.max(0, remaining));
    return () => window.clearTimeout(timer);
  }, [isGlobeDeferred, handoffStartedAt]);

  useEffect(() => {
    if (handoffCamera === null || isGlobeDeferred) return;
    if (!isGlobe) {
      reveal();
      return;
    }

    const fallback = window.setTimeout(reveal, REVEAL_FALLBACK_MS);
    return () => window.clearTimeout(fallback);
  }, [isGlobe, isGlobeDeferred, handoffCamera, reveal]);

  if (!flight) {
    return null;
  }

  const canShare = flight.tracking !== Tracking.Disabled;
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
  const globeProps = {
    ...mapProps,
    entryCamera: handoffCamera,
    onCameraChange: entry?.rememberFlightCamera,
    onReady: handoffCamera === null ? undefined : reveal,
  };

  return (
    <div ref={ref} className={twMerge("relative flex flex-col gap-3", className)}>
      <MapSettingsProvider intent={HISTORY_MAP_INTENT}>
        <div
          ref={strip.coverRef}
          className={twMerge(
            "relative h-[clamp(24rem,62dvh,40rem)] overflow-hidden rounded-2xl border border-gray-200 transition-opacity duration-200 motion-reduce:transition-none md:h-full md:rounded-none md:border-0 dark:border-gray-800",
            !isRevealed && "opacity-0",
          )}
        >
          {isGlobe ? (
            !isGlobeDeferred && (
              <Suspense fallback={<div className="h-full w-full animate-pulse bg-gray-100 dark:bg-gray-900" />}>
                <FlightRouteGlobeMap {...globeProps} />
              </Suspense>
            )
          ) : (
            <FlightRouteMap {...mapProps} />
          )}
          <MapFixCard
            isOpen={isFixCardOpen}
            topInset={topInset}
            bottomInset={strip.coveredHeight}
            onClose={() => setIsFixCardOpen(false)}
            onFocus={setFixFocus}
          />
        </div>
        <div
          ref={strip.targetRef}
          data-history-profile=""
          data-entering={isEntering || undefined}
          className="z-20 md:pointer-events-none md:absolute md:inset-x-0 md:bottom-0 md:pb-6"
        >
          <div className="md:mx-auto md:max-w-7xl md:px-6">
            <section
              aria-label="Vertical profile"
              className="rounded-2xl border border-gray-200 bg-white px-3 pt-2.5 pb-2 md:pointer-events-auto dark:border-gray-700 dark:bg-gray-900"
            >
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <MapOptionsControl
                  size="sm"
                  triggerClassName="relative"
                  projection={projection}
                  onProjectionChange={setProjection}
                  hasFiledRoute={hasFiledWaypoints(plannedRoute?.briefing)}
                  hasEtopsRings={hasEtopsRings(plannedRoute?.briefing)}
                />
                <FieldLabel>Vertical profile</FieldLabel>
                <Legend hasPlan={planned.length > 0} />
                <div className="ms-auto flex flex-wrap items-center justify-end gap-x-4 gap-y-2">
                  <ProfileReadout path={flightPath} point={cursorIndex === null ? null : flightPath[cursorIndex]} />
                  {canShare && <MapShareLinks flightId={flight.id} />}
                </div>
              </div>
              {flightPath.length > 1 ? (
                <VerticalProfile
                  path={flightPath}
                  timesheet={flight.timesheet}
                  planned={planned}
                  cursorIndex={cursorIndex}
                  onCursorChange={setCursorIndex}
                  className="mt-2"
                />
              ) : (
                <ProfileNotice>
                  {pathLoadFailed
                    ? "The recorded track could not be loaded. Reload the page to try again."
                    : "No track was recorded for this flight."}
                </ProfileNotice>
              )}
            </section>
          </div>
        </div>
      </MapSettingsProvider>
    </div>
  );
}
