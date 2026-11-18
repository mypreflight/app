import { Button } from "flowbite-react";
import React from "react";
import { FaFileImport, FaPlaneDeparture, FaTriangleExclamation } from "react-icons/fa6";
import { LuFileDown } from "react-icons/lu";
import type { Airport } from "~/features/airport";
import type { Flight } from "~/features/flight";
import { BlockTimeStat } from "~/features/flight/components/Dashboard/Main/Box/BlockTimeStat";
import { FlightIdentity } from "~/features/flight/components/FlightIdentity";
import { offBlockEvent, resolveBlockEvents } from "~/features/flight/lib/blockEvents";
import { DetailLinkButton } from "~/shared/ui/Button/DetailLinkButton";
import { AirportEndpoint } from "~/shared/ui/Display/AirportEndpoint";
import { CardHeader } from "~/shared/ui/Layout/CardHeader";
import { Container } from "~/shared/ui/Layout/Container";
import { EmptyState } from "~/shared/ui/Layout/EmptyState";
import { TilePlaceholder } from "~/shared/ui/Layout/TilePlaceholder";

export type SimbriefImportOption = {
  hasSimbriefId: boolean;
  open: () => void;
};

type Props = {
  flight: Flight | null;
  failed: boolean;
  departure?: Airport | null;
  simbriefImport?: SimbriefImportOption | null;
};

function importLabel({ hasSimbriefId }: SimbriefImportOption): string {
  return hasSimbriefId ? "Import from SimBrief" : "Add SimBrief ID";
}

function ImportButton({ simbriefImport }: { simbriefImport: SimbriefImportOption }) {
  return (
    <Button size="sm" color="alternative" onClick={simbriefImport.open}>
      <FaFileImport className="me-2 size-3.5" aria-hidden={true} />
      {importLabel(simbriefImport)}
    </Button>
  );
}

function ImportPrompt({ simbriefImport }: { simbriefImport: SimbriefImportOption }) {
  return (
    <EmptyState
      icon={LuFileDown}
      tone="accent"
      title="No flight scheduled"
      description={
        simbriefImport.hasSimbriefId
          ? "Import your latest SimBrief flight plan and fly it right away."
          : "Add your SimBrief ID in order to import your first flight plan."
      }
      action={
        <Button color="indigo" size="sm" onClick={simbriefImport.open} className="px-4">
          {importLabel(simbriefImport)}
        </Button>
      }
    />
  );
}

function PendingEndpoint({ caption, align = "left" }: { caption: string; align?: "left" | "right" }) {
  return (
    <div className={`flex min-w-0 flex-col ${align === "right" ? "items-end text-right" : "items-start"}`}>
      <span className="block h-6 w-14 rounded-md border border-dashed border-gray-300 dark:border-gray-600" />
      <span className="mt-0.5 block truncate text-xs text-gray-500 dark:text-gray-400">{caption}</span>
    </div>
  );
}

function AwaitingDispatch({ departure }: { departure: Airport | null }) {
  return (
    <>
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="ms-1 flex size-10 shrink-0 items-center justify-center rounded-lg border border-dashed border-gray-300 text-gray-400 dark:border-gray-600 dark:text-gray-500">
          <FaPlaneDeparture size={14} aria-hidden={true} />
        </span>
        <span className="min-w-0">
          <span className="block text-base font-bold leading-tight text-gray-900 dark:text-white">
            Awaiting dispatch
          </span>
          <span className="block text-xs text-gray-500 dark:text-gray-400">Not yet scheduled by Operations.</span>
        </span>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,1fr)] items-start gap-3">
        {departure ? (
          <AirportEndpoint iataCode={departure.iataCode} subtitle={departure.city.name} />
        ) : (
          <PendingEndpoint caption="Departure" />
        )}
        <div className="mt-3 flex items-center gap-1.5 text-gray-300 dark:text-gray-600">
          <span className="size-1.5 flex-none rounded-full bg-current" />
          <span className="flex-1 border-t border-dashed border-current" />
          <FaPlaneDeparture className="flex-none" size={15} aria-hidden={true} />
          <span className="flex-1 border-t border-dashed border-current" />
          <span className="size-1.5 flex-none rounded-full border border-current" />
        </div>
        <PendingEndpoint caption="Destination" align="right" />
      </div>
    </>
  );
}

export function NextScheduledFlightBox({ flight, failed, departure = null, simbriefImport = null }: Props) {
  if (failed) {
    return (
      <Container padding="condensed" header={<CardHeader title="Next scheduled flight" />}>
        <TilePlaceholder
          icon={FaTriangleExclamation}
          hint="Upcoming flights could not be loaded. Reload the page to try again."
        />
        {simbriefImport && (
          <div className="flex justify-end">
            <ImportButton simbriefImport={simbriefImport} />
          </div>
        )}
      </Container>
    );
  }

  if (!flight) {
    return (
      <Container padding="condensed" header={<CardHeader title="Next scheduled flight" />}>
        {simbriefImport ? <ImportPrompt simbriefImport={simbriefImport} /> : <AwaitingDispatch departure={departure} />}
      </Container>
    );
  }

  const offBlock = offBlockEvent(resolveBlockEvents(flight.timesheet));

  return (
    <Container padding="condensed" header={<CardHeader title="Next scheduled flight" />}>
      <div className="flex items-start justify-between gap-3">
        <FlightIdentity
          operator={flight.operator}
          flightNumber={flight.flightNumber}
          aircraftId={flight.aircraft.id}
          registration={flight.aircraft.registration}
          size="md"
        />
        <BlockTimeStat event={offBlock} />
      </div>

      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,1fr)] items-center gap-3">
          <AirportEndpoint iataCode={flight.departureAirport.iataCode} subtitle={flight.departureAirport.city.name} />
          <div className="flex items-center gap-1.5 text-gray-300 dark:text-gray-600">
            <span className="size-1.5 flex-none rounded-full bg-current" />
            <span className="flex-1 border-t border-dashed border-current" />
            <FaPlaneDeparture className="flex-none text-gray-500 dark:text-gray-400" size={15} aria-hidden={true} />
            <span className="flex-1 border-t border-dashed border-current" />
            <span className="size-1.5 flex-none rounded-full bg-current" />
          </div>
          <AirportEndpoint
            iataCode={flight.destinationAirport.iataCode}
            subtitle={flight.destinationAirport.city.name}
            align="right"
          />
        </div>

        <div className="flex justify-end">
          <DetailLinkButton to={`/track/${flight.id}`}>See flight details</DetailLinkButton>
        </div>
      </div>
    </Container>
  );
}
