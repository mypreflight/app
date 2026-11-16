import React, { type ReactNode, useEffect, useState } from "react";
import { ArrivalBriefing } from "~/features/flight/components/Briefing/ArrivalBriefing";
import { BriefingDocumentButtons } from "~/features/flight/components/Briefing/BriefingDocumentButtons";
import { BriefingPhaseHeader } from "~/features/flight/components/Briefing/BriefingPhaseHeader";
import { BriefingPhaseTabs } from "~/features/flight/components/Briefing/BriefingPhaseTabs";
import { EnRouteBriefing } from "~/features/flight/components/Briefing/EnRouteBriefing";
import { PreflightBriefing } from "~/features/flight/components/Briefing/PreflightBriefing";
import { useFlightDocuments } from "~/features/flight/hooks/useFlightDocuments";
import { useTrackedFlight } from "~/features/flight/hooks/useTrackedFlight";
import type { TrackingViewState } from "~/features/flight/hooks/useTrackingView";
import {
  BRIEFING_PHASES,
  BriefingDocument,
  BriefingPhase,
  briefingPhaseState,
  currentBriefingPhase,
  flownTrack,
  hasOceanicTrack,
  NO_PASSENGERS,
  topOfDescentAt,
} from "~/features/flight/lib/briefingPhase";
import { TrackingView, trackFlightPath } from "~/features/flight/lib/trackingView";
import { type Flight, FlightServiceType, FlightSource } from "~/features/flight/model";
import { useRouteBriefingState } from "~/features/route/hooks/useRouteBriefing";
import type { OceanicCrossing } from "~/features/route/model";
import { dateToIcaoTime } from "~/shared/ui/Date/FormattedIcaoTime";

type Props = {
  trackingView: TrackingViewState;
};

const MINUTE = 60_000;
const SIMBRIEF_ONLY = "Available for flights planned with SimBrief.";

function useMinuteClock(): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), MINUTE);

    return () => clearInterval(interval);
  }, []);

  return now;
}

function zulu(date: Date | null | undefined): string | null {
  return date === null || date === undefined ? null : `${dateToIcaoTime(date)}Z`;
}

function offBlock(flight: Flight): Date {
  return (
    flight.timesheet.actual?.offBlockTime ??
    flight.timesheet.estimated?.offBlockTime ??
    flight.timesheet.scheduled.offBlockTime
  );
}

function arrival(flight: Flight): Date {
  return (
    flight.timesheet.actual?.onBlockTime ??
    flight.timesheet.estimated?.onBlockTime ??
    flight.timesheet.scheduled.onBlockTime
  );
}

function crossingSummary(crossing: OceanicCrossing | null | undefined): string | null {
  const track = flownTrack(crossing);

  return track === null
    ? null
    : `Track ${track.identifier} · TMI ${track.tmi}${track.issuingOca ? ` · ${track.issuingOca}` : ""}`;
}

export function FlightBriefing({ trackingView }: Props) {
  const { flight } = useTrackedFlight();
  const route = useRouteBriefingState();
  const now = useMinuteClock();
  const { documentHref, entry } = useFlightDocuments(trackingView);

  if (flight === null) {
    return null;
  }

  const crossing = route.briefing?.oceanicCrossing;
  const topOfDescent = topOfDescentAt(route.briefing?.route.fixes ?? [], route.takeoffTime);
  const current = currentBriefingPhase(flight.status, topOfDescent, now);
  const selected = trackingView.phase ?? current;
  const isOceanic = hasOceanicTrack(crossing);
  const simbrief = flight.source === FlightSource.SimBrief;
  const passengers = flight.serviceType === FlightServiceType.Passenger;

  const heads: Record<BriefingPhase, { label: string; title: string; summary: ReactNode }> = {
    [BriefingPhase.Preflight]: {
      label: "Preflight",
      title: "Preflight briefing",
      summary: `${flight.departureAirport.city.name} · off-block ${zulu(offBlock(flight))}`,
    },
    [BriefingPhase.EnRoute]: {
      label: isOceanic ? "Oceanic" : "En route",
      title: isOceanic ? "Oceanic crossing" : "En route",
      summary:
        crossingSummary(crossing) ?? `${flight.departureAirport.iataCode} to ${flight.destinationAirport.iataCode}`,
    },
    [BriefingPhase.Arrival]: {
      label: "Arrival",
      title: "Arrival briefing",
      summary: `${flight.destinationAirport.city.name} · on-block ${zulu(arrival(flight))}`,
    },
  };

  const tabs = BRIEFING_PHASES.map((each) => ({
    phase: each,
    label: heads[each].label,
    summary: heads[each].summary,
    state: briefingPhaseState(each, current),
    href: trackFlightPath(flight.id, TrackingView.Briefing, each === current ? null : each),
  }));

  return (
    <div className="flex flex-col gap-3">
      <BriefingPhaseTabs tabs={tabs} selected={selected} />

      <BriefingPhaseHeader title={heads[selected].title} summary={heads[selected].summary}>
        <BriefingDocumentButtons
          documents={[
            entry(BriefingDocument.NavLog, "Nav log", simbrief ? undefined : SIMBRIEF_ONLY),
            entry(BriefingDocument.Ofp, "OFP", simbrief ? undefined : SIMBRIEF_ONLY),
            entry(BriefingDocument.RunwayAnalysis, "Runway analysis", simbrief ? undefined : SIMBRIEF_ONLY),
            entry(BriefingDocument.Notoc, "NOTOC"),
            entry(BriefingDocument.Pil, "PIL", passengers ? undefined : NO_PASSENGERS),
          ]}
        />
      </BriefingPhaseHeader>

      {selected === BriefingPhase.Preflight && <PreflightBriefing documentHref={documentHref} />}
      {selected === BriefingPhase.EnRoute && <EnRouteBriefing navLogHref={documentHref(BriefingDocument.NavLog)} />}
      {selected === BriefingPhase.Arrival && <ArrivalBriefing />}
    </div>
  );
}
