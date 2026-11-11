import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { FlightSource } from "~/features/flight";
import { FlightHistoryHeader } from "~/features/flight/components/Dashboard/History/Header/FlightHistoryHeader";
import { HistoryMapBox } from "~/features/flight/components/Dashboard/History/Map/HistoryMapBox";
import { FlightRecordCard } from "~/features/flight/components/Dashboard/History/Record/FlightRecordCard";
import { HistoryDocumentTabs } from "~/features/flight/components/Dashboard/History/Tabs/HistoryDocumentTabs";
import { HistoryCargoTab } from "~/features/flight/components/Dashboard/History/Tabs/Tab/HistoryCargoTab";
import { HistoryDelaysTab } from "~/features/flight/components/Dashboard/History/Tabs/Tab/HistoryDelaysTab";
import { HistoryEventsTab } from "~/features/flight/components/Dashboard/History/Tabs/Tab/HistoryEventsTab";
import { HistoryFuelAndLoadTab } from "~/features/flight/components/Dashboard/History/Tabs/Tab/HistoryFuelAndLoadTab";
import { HistoryOfpTab } from "~/features/flight/components/Dashboard/History/Tabs/Tab/HistoryOfpTab";
import { HistoryPassengersTab } from "~/features/flight/components/Dashboard/History/Tabs/Tab/HistoryPassengersTab";
import { HistoryRouteTab } from "~/features/flight/components/Dashboard/History/Tabs/Tab/HistoryRouteTab";
import { HistoryRunwayAnalysisTab } from "~/features/flight/components/Dashboard/History/Tabs/Tab/HistoryRunwayAnalysisTab";
import { useHistoryFlight } from "~/features/flight/hooks/useHistoryFlight";
import {
  defaultHistoryTab,
  HistoryTab,
  HistoryView,
  historyFlightPath,
  resolveHistoryLocation,
} from "~/features/flight/lib/historyView";
import { RouteBriefingProvider } from "~/features/route/hooks/useRouteBriefing";
import { useCoveredHeight } from "~/shared/hooks/useCoveredHeight";
import { usePageTitle } from "~/shared/hooks/usePageTitle";
import { LoadFailedState } from "~/shared/ui/Display/LoadFailedState";

const MAP_OVERLAY =
  "md:pointer-events-none md:absolute md:inset-0 md:z-10 md:overflow-y-auto md:[scrollbar-gutter:stable]";
const MAP_OVERLAY_COLUMN = "md:mx-auto md:max-w-7xl md:p-6 md:*:pointer-events-auto";
const MAP_LAYER = "md:absolute md:inset-0";
const PARKED_MAP_LAYER = "invisible absolute inset-0";

function TabPanel({ tab, flightId }: { tab: HistoryTab; flightId: string }) {
  switch (tab) {
    case HistoryTab.Route:
      return <HistoryRouteTab />;
    case HistoryTab.FuelAndCrew:
      return <HistoryFuelAndLoadTab />;
    case HistoryTab.Passengers:
      return <HistoryPassengersTab />;
    case HistoryTab.Cargo:
      return <HistoryCargoTab />;
    case HistoryTab.OperationalFlightPlan:
      return <HistoryOfpTab />;
    case HistoryTab.RunwayAnalysis:
      return <HistoryRunwayAnalysisTab />;
    case HistoryTab.Events:
      return <HistoryEventsTab />;
    case HistoryTab.Delays:
      return <HistoryDelaysTab flightId={flightId} />;
  }
}

type Props = {
  flightId: string;
  viewSlug: string | undefined;
  tabSlug: string | undefined;
};

export function FlightHistoryDashboard({ flightId, viewSlug, tabSlug }: Props) {
  const { flight, diversion, loadsheets, loadFailed } = useHistoryFlight();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isSimbriefAvailable = flight?.source === FlightSource.SimBrief;
  const { view, tab } = resolveHistoryLocation(viewSlug, tabSlug, isSimbriefAvailable);
  const isHistoryView = view === HistoryView.History;
  const mapCover = useCoveredHeight<HTMLDivElement, HTMLDivElement>(isHistoryView && flight !== null);
  const [isMapMounted, setIsMapMounted] = useState(false);
  const [documentsTab, setDocumentsTab] = useState<HistoryTab | null>(null);
  const canonicalPath = historyFlightPath(flightId, view, isHistoryView ? undefined : tab);

  usePageTitle(flight ? `Flight history · ${flight.flightNumber}` : "Flight history");

  if (isHistoryView && !isMapMounted) {
    setIsMapMounted(true);
  }

  if (!isHistoryView && tab !== documentsTab) {
    setDocumentsTab(tab);
  }

  useEffect(() => {
    if (flight !== null && canonicalPath !== pathname) {
      navigate(canonicalPath, { replace: true });
    }
  }, [flight, canonicalPath, pathname, navigate]);

  if (loadFailed) {
    return <LoadFailedState title="This flight could not be loaded. Reload the page to try again." />;
  }

  if (!flight) {
    return <div className="py-16 text-center text-gray-500 dark:text-gray-400">Loading…</div>;
  }

  const views = [
    { key: HistoryView.History, label: "History", to: historyFlightPath(flight.id) },
    {
      key: HistoryView.Documents,
      label: "Documents",
      to: historyFlightPath(flight.id, HistoryView.Documents, documentsTab ?? defaultHistoryTab(isSimbriefAvailable)),
    },
  ];

  return (
    <RouteBriefingProvider flight={flight}>
      <div data-full-bleed={isHistoryView || undefined} className={isHistoryView ? MAP_OVERLAY : undefined}>
        <div className={isHistoryView ? MAP_OVERLAY_COLUMN : undefined}>
          <div ref={mapCover.coverRef} className="mb-4 flex flex-col gap-3">
            <FlightHistoryHeader flight={flight} diversion={diversion} views={views} activeView={view} />
            <FlightRecordCard
              flight={flight}
              loadsheets={loadsheets}
              className={isHistoryView ? "hidden md:flex" : undefined}
            />
          </div>
        </div>
      </div>

      {isMapMounted && (
        <HistoryMapBox
          key={flight.id}
          ref={mapCover.targetRef}
          className={isHistoryView ? MAP_LAYER : PARKED_MAP_LAYER}
          topInset={mapCover.coveredHeight}
        />
      )}

      {isHistoryView && <FlightRecordCard flight={flight} loadsheets={loadsheets} className="mt-3 md:hidden" />}

      {!isHistoryView && (
        <>
          <HistoryDocumentTabs
            tab={tab}
            setTab={(next) => navigate(historyFlightPath(flight.id, HistoryView.Documents, next))}
            isSimbriefAvailable={isSimbriefAvailable}
          />
          <div className="mt-4 flex flex-col gap-4">
            <TabPanel tab={tab} flightId={flight.id} />
          </div>
        </>
      )}
    </RouteBriefingProvider>
  );
}
