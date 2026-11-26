import React, { type ReactNode } from "react";
import { FaRoute } from "react-icons/fa6";
import { FlightCargoPanel } from "~/features/cargo-manifest/components/FlightCargoPanel";
import { BriefingDocumentDrawer, type DrawerWidth } from "~/features/flight/components/Briefing/BriefingDocumentDrawer";
import { PassengerInformationList } from "~/features/flight/components/Briefing/PassengerInformationList";
import { FlightManifestPanel } from "~/features/flight/components/Cabin/FlightManifestPanel";
import { ManifestUnavailableState } from "~/features/flight/components/Cabin/ManifestUnavailableState";
import { FlightDelaysTab } from "~/features/flight/components/Dashboard/Tabs/Tab/FlightDelaysTab";
import { FlightEmergenciesDiversionsTab } from "~/features/flight/components/Dashboard/Tabs/Tab/FlightEmergenciesDiversionsTab";
import { FlightOfpTab } from "~/features/flight/components/Dashboard/Tabs/Tab/FlightOfpTab";
import { FlightRunwayAnalysisTab } from "~/features/flight/components/Dashboard/Tabs/Tab/FlightRunwayAnalysisTab";
import { FlightEventsTimeline } from "~/features/flight/components/Overview/FlightEventsTimeline";
import { FlightTimesheets } from "~/features/flight/components/Overview/FlightTimesheets";
import { useFlightCabin } from "~/features/flight/hooks/useFlightCabin";
import { useTrackedFlight } from "~/features/flight/hooks/useTrackedFlight";
import { BriefingDocument } from "~/features/flight/lib/briefingPhase";
import type { Flight, SpecialServiceRequest } from "~/features/flight/model";
import { NotocConfirmationStep } from "~/features/notoc/components/NotocConfirmationStep";
import { FuelMarginNote } from "~/features/route/components/NavLog/FuelMarginNote";
import { NavLog } from "~/features/route/components/NavLog/NavLog";
import { useRouteBriefingState } from "~/features/route/hooks/useRouteBriefing";
import { PanelEmptyState } from "~/shared/ui/Display/PanelEmptyState";
import { LoadingData } from "~/shared/ui/Table/LoadingStates/LoadingData";

type Props = {
  document: BriefingDocument;
  pilRequest: SpecialServiceRequest | null;
  onPilRequestChange: (request: SpecialServiceRequest | null) => void;
  onClose: () => void;
};

type DocumentView = {
  title: string;
  width?: DrawerWidth;
  body: ReactNode;
};

export function FlightBriefingDocument({ document, pilRequest, onPilRequestChange, onClose }: Props) {
  const { flight } = useTrackedFlight();

  if (flight === null) {
    return null;
  }

  const view = documentView(flight, document, pilRequest, onPilRequestChange);

  return (
    <BriefingDocumentDrawer
      title={view.title}
      width={view.width}
      returnFocusTo={`briefing-document-${document}`}
      onClose={onClose}
    >
      {view.body}
    </BriefingDocumentDrawer>
  );
}

function documentView(
  flight: Flight,
  document: BriefingDocument,
  pilRequest: SpecialServiceRequest | null,
  onPilRequestChange: (request: SpecialServiceRequest | null) => void,
): DocumentView {
  switch (document) {
    case BriefingDocument.NavLog:
      return { title: "Nav log", body: <NavLogDocument /> };
    case BriefingDocument.Ofp:
      return { title: "OFP", body: <FlightOfpTab /> };
    case BriefingDocument.RunwayAnalysis:
      return { title: "Runway analysis", body: <FlightRunwayAnalysisTab /> };
    case BriefingDocument.Notoc:
      return { title: "NOTOC", body: <NotocConfirmationStep flight={flight} /> };
    case BriefingDocument.Pil:
      return {
        title: "Passenger information list",
        body: <PilDocument flight={flight} request={pilRequest} onRequestChange={onPilRequestChange} />,
      };
    case BriefingDocument.Cabin:
      return { title: "Cabin and manifest", width: "wide", body: <CabinDocument flight={flight} /> };
    case BriefingDocument.Cargo:
      return { title: "Cargo", width: "wide", body: <FlightCargoPanel flight={flight} /> };
    case BriefingDocument.Timesheet:
      return { title: "Timesheet", body: <FlightTimesheets /> };
    case BriefingDocument.Activity:
      return { title: "Activity log", body: <ActivityDocument flight={flight} /> };
    case BriefingDocument.Delay:
      return { title: "Delay report", body: <FlightDelaysTab /> };
    case BriefingDocument.Emergencies:
      return { title: "Emergencies and diversions", width: "wide", body: <FlightEmergenciesDiversionsTab /> };
  }
}

function NavLogDocument() {
  const { insights, loading, selectedOrdinal, select, canReportFuel, takeoffTime, reportFixFuel, margin } =
    useRouteBriefingState();

  if (loading) {
    return <LoadingData />;
  }

  if (insights.length === 0) {
    return (
      <PanelEmptyState
        icon={FaRoute}
        title="No nav log"
        body="This flight carries no filed plan, so there are no fixes to list."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {margin !== null && <FuelMarginNote margin={margin} onSelect={select} />}
      <NavLog
        insights={insights}
        selectedOrdinal={selectedOrdinal}
        onSelect={select}
        canReportFuel={canReportFuel}
        takeoffTime={takeoffTime}
        onReportFuel={reportFixFuel}
      />
    </div>
  );
}

function PilDocument({
  flight,
  request,
  onRequestChange,
}: {
  flight: Flight;
  request: SpecialServiceRequest | null;
  onRequestChange: (request: SpecialServiceRequest | null) => void;
}) {
  const cabin = useFlightCabin(flight);

  if (cabin.status === "loading") {
    return <LoadingData />;
  }

  if (cabin.status === "unavailable") {
    return <ManifestUnavailableState gap={cabin.gap} />;
  }

  return (
    <PassengerInformationList
      passengers={cabin.manifest.passengers}
      request={request}
      onRequestChange={onRequestChange}
    />
  );
}

function CabinDocument({ flight }: { flight: Flight }) {
  const { loadsheets } = useTrackedFlight();

  return <FlightManifestPanel flight={flight} loadsheets={loadsheets} />;
}

function ActivityDocument({ flight }: { flight: Flight }) {
  const { events } = useTrackedFlight();

  return <FlightEventsTimeline events={events} serviceType={flight.serviceType} />;
}
