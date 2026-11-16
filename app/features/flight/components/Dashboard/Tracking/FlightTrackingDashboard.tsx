import React, { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { ShellSlot, ShellSlotPortal } from "~/app-state/useShellSlots";
import { FlightStatus } from "~/features/flight";
import { FlightBriefing } from "~/features/flight/components/Briefing/FlightBriefing";
import { FlightRecords } from "~/features/flight/components/Briefing/FlightRecords";
import { DelayNotice } from "~/features/flight/components/Dashboard/Tracking/DelayNotice";
import { DiversionBanner } from "~/features/flight/components/Dashboard/Tracking/Header/DiversionBanner";
import { FlightQuickStatus } from "~/features/flight/components/Dashboard/Tracking/Header/FlightQuickStatus";
import { FlightTopBar } from "~/features/flight/components/Dashboard/Tracking/Header/FlightTopBar";
import { FlightTrackingHeader } from "~/features/flight/components/Dashboard/Tracking/Header/FlightTrackingHeader";
import { MapBox } from "~/features/flight/components/Dashboard/Tracking/Map/MapBox";
import { FlightPhaseCard } from "~/features/flight/components/Dashboard/Tracking/Progress/FlightPhaseCard";
import { useTrackedFlight } from "~/features/flight/hooks/useTrackedFlight";
import { useTrackedFlightAdsb } from "~/features/flight/hooks/useTrackedFlightAdsb";
import { useIsSwitchingTrackingView, useTrackingView } from "~/features/flight/hooks/useTrackingView";
import { BriefingDocument } from "~/features/flight/lib/briefingPhase";
import { TrackingView, trackingMapIntent } from "~/features/flight/lib/trackingView";
import { RouteBriefingProvider } from "~/features/route/hooks/useRouteBriefing";
import { useCoveredHeight } from "~/shared/hooks/useCoveredHeight";
import { usePageTitle } from "~/shared/hooks/usePageTitle";

const MAP_OVERLAY =
  "md:pointer-events-none md:absolute md:inset-0 md:z-10 md:overflow-y-auto md:[scrollbar-gutter:stable]";
const MAP_OVERLAY_COLUMN = "md:mx-auto md:max-w-7xl md:p-6 md:*:pointer-events-auto";
const MAP_LAYER =
  "h-[clamp(24rem,70dvh,48rem)] overflow-hidden rounded-2xl border border-gray-200 md:absolute md:inset-0 md:h-auto md:rounded-none md:border-0 dark:border-gray-800";
const PARKED_MAP_LAYER = "invisible absolute inset-0";

type Props = {
  flightId: string;
  viewSlug: string | undefined;
  tabSlug: string | undefined;
};

export function FlightTrackingDashboard({ flightId, viewSlug, tabSlug }: Props) {
  const { flight, diversion, setFlightId } = useTrackedFlight();
  const trackingView = useTrackingView(flightId, flight, viewSlug, tabSlug);
  const isTracking = trackingView?.view === TrackingView.Tracking;
  const mapCover = useCoveredHeight<HTMLDivElement, HTMLDivElement>(isTracking);
  const isSwitchingView = useIsSwitchingTrackingView(flightId);
  const [isMapMounted, setIsMapMounted] = useState(false);
  useTrackedFlightAdsb();

  usePageTitle(flight ? `Tracking flight ${flight.flightNumber}` : "Tracking");

  useEffect(() => {
    setFlightId(flightId);
  }, [flightId, setFlightId]);

  if (isTracking && !isMapMounted) {
    setIsMapMounted(true);
  }

  if (!flight || !trackingView) {
    return <div>Loading…</div>;
  }

  return (
    <RouteBriefingProvider flight={flight} canReportFuel={flight.status === FlightStatus.InCruise}>
      <ShellSlotPortal slot={ShellSlot.TopBar}>
        <FlightTopBar flight={flight} diverted={diversion !== null} trackingView={trackingView} />
      </ShellSlotPortal>
      <ShellSlotPortal slot={ShellSlot.SidebarStatus}>
        <FlightQuickStatus stacked={true} />
      </ShellSlotPortal>
      <div data-full-bleed={isTracking || undefined} className={isTracking ? MAP_OVERLAY : undefined}>
        <div className={isTracking ? MAP_OVERLAY_COLUMN : undefined}>
          <DelayNotice isDelayReportShown={trackingView.document === BriefingDocument.Delay} />
          <div
            ref={mapCover.coverRef}
            className={twMerge("mb-4 flex flex-col gap-3", isSwitchingView && "[view-transition-name:tracking-cards]")}
          >
            <FlightTrackingHeader trackingView={trackingView} className="md:hidden" />
            {diversion && (
              <div className="max-md:hidden">
                <DiversionBanner diversion={diversion} />
              </div>
            )}
            <FlightPhaseCard />
          </div>
        </div>
      </div>

      {isMapMounted && (
        <MapBox
          key={flight.id}
          ref={mapCover.targetRef}
          className={isTracking ? MAP_LAYER : PARKED_MAP_LAYER}
          mapIntent={trackingMapIntent(flight.status)}
          topInset={mapCover.coveredHeight}
        />
      )}

      {!isTracking && <FlightBriefing trackingView={trackingView} />}
      <FlightRecords trackingView={trackingView} />
    </RouteBriefingProvider>
  );
}
