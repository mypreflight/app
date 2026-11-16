import React, { useState } from "react";
import { ShellSlot, ShellSlotPortal } from "~/app-state/useShellSlots";
import { ReportDiversionModal } from "~/features/diversion/components/ReportDiversionModal";
import { DeclareEmergencyModal } from "~/features/emergency/components/DeclareEmergencyModal";
import { BriefingRecordsStrip } from "~/features/flight/components/Briefing/BriefingRecordsStrip";
import { FlightBriefingDocument } from "~/features/flight/components/Briefing/FlightBriefingDocument";
import { useFlightDocuments } from "~/features/flight/hooks/useFlightDocuments";
import { useTrackedFlight } from "~/features/flight/hooks/useTrackedFlight";
import type { TrackingViewState } from "~/features/flight/hooks/useTrackingView";
import { isInDiversionWindow, isInEmergencyWindow } from "~/features/flight/lib/abnormalActions";
import { BriefingDocument, NO_PASSENGERS } from "~/features/flight/lib/briefingPhase";
import { FlightServiceType } from "~/features/flight/model";
import { SHELL_BARS_QUERY, useMediaQuery } from "~/shared/hooks/useMediaQuery";

type Props = {
  trackingView: TrackingViewState;
};

const RECORDS_CARD =
  "mt-3 rounded-2xl border border-gray-200 bg-white px-3 py-2.5 dark:border-gray-800 dark:bg-gray-900";

export function FlightRecords({ trackingView }: Props) {
  const { flight, activeEmergency, diversion, emergencies } = useTrackedFlight();
  const { entry, closeDocument, pilRequest, changePilRequest } = useFlightDocuments(trackingView);
  const hasShellBars = useMediaQuery(SHELL_BARS_QUERY);
  const [declaring, setDeclaring] = useState(false);
  const [reportingDiversion, setReportingDiversion] = useState(false);

  if (flight === null) {
    return null;
  }

  const passengers = flight.serviceType === FlightServiceType.Passenger;
  const hasAbnormalRecord = emergencies.length > 0 || diversion !== null;

  const records = (
    <BriefingRecordsStrip
      load={[
        entry(BriefingDocument.Cabin, "Cabin and manifest", passengers ? undefined : NO_PASSENGERS),
        entry(BriefingDocument.Cargo, "Cargo"),
      ]}
      records={[
        entry(BriefingDocument.Timesheet, "Timesheet"),
        entry(BriefingDocument.Activity, "Activity log"),
        entry(BriefingDocument.Delay, "Delay report"),
        ...(hasAbnormalRecord ? [entry(BriefingDocument.Emergencies, "Emergencies and diversions")] : []),
      ]}
      canDeclareEmergency={isInEmergencyWindow(flight.status) && activeEmergency === null}
      canReportDiversion={isInDiversionWindow(flight.status) && diversion === null}
      onDeclareEmergency={() => setDeclaring(true)}
      onReportDiversion={() => setReportingDiversion(true)}
      className={hasShellBars ? undefined : RECORDS_CARD}
    />
  );

  return (
    <>
      {hasShellBars ? <ShellSlotPortal slot={ShellSlot.BottomBar}>{records}</ShellSlotPortal> : records}

      {trackingView.document !== null && (
        <FlightBriefingDocument
          document={trackingView.document}
          pilRequest={pilRequest}
          onPilRequestChange={changePilRequest}
          onClose={closeDocument}
        />
      )}

      {declaring && <DeclareEmergencyModal close={() => setDeclaring(false)} />}
      {reportingDiversion && <ReportDiversionModal close={() => setReportingDiversion(false)} />}
    </>
  );
}
