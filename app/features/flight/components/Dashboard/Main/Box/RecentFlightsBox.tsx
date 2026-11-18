import React from "react";
import { FaArrowRight } from "react-icons/fa";
import { FaClockRotateLeft, FaTriangleExclamation } from "react-icons/fa6";
import { LuPlaneLanding } from "react-icons/lu";
import { Link } from "react-router";
import type { Flight } from "~/features/flight";
import { listOffBlockTimeOf } from "~/features/flight/lib/flightListTimes";
import { historyFlightPath } from "~/features/flight/lib/historyView";
import { OperatorFin } from "~/features/operator/components/OperatorFin";
import { dateToDayMonth } from "~/shared/ui/Date/FormattedIcaoDate";
import { CardFooterLink } from "~/shared/ui/Layout/CardFooterLink";
import { CardHeader } from "~/shared/ui/Layout/CardHeader";
import { Container } from "~/shared/ui/Layout/Container";
import { EmptyState } from "~/shared/ui/Layout/EmptyState";
import { TilePlaceholder } from "~/shared/ui/Layout/TilePlaceholder";

type Props = {
  flights: Flight[];
  failed: boolean;
};

function RecentFlightRow({ flight }: { flight: Flight }) {
  const { departureAirport, destinationAirport } = flight;
  const flownOn = dateToDayMonth(listOffBlockTimeOf(flight));

  return (
    <li className="col-span-4 grid grid-cols-subgrid">
      <Link
        to={historyFlightPath(flight.id)}
        viewTransition
        aria-label={`${flight.flightNumber}, ${departureAirport.iataCode} to ${destinationAirport.iataCode}, ${flownOn}`}
        className="col-span-4 grid grid-cols-subgrid items-center px-3 py-2 transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 motion-reduce:transition-none dark:hover:bg-gray-800/50 dark:focus-visible:ring-indigo-400 pointer-coarse:py-3"
      >
        <span className="flex size-7 items-center justify-center">
          <OperatorFin operator={flight.operator} />
        </span>
        <span className="truncate font-mono text-sm font-bold text-gray-900 dark:text-white">
          {flight.flightNumber}
        </span>
        <span className="flex items-center gap-1.5 font-mono text-sm text-gray-700 dark:text-gray-200">
          {departureAirport.iataCode}
          <FaArrowRight aria-hidden={true} size={9} className="shrink-0 text-gray-500 dark:text-gray-400" />
          {destinationAirport.iataCode}
        </span>
        <span className="text-end font-mono text-xs tabular-nums text-gray-500 dark:text-gray-400">{flownOn}</span>
      </Link>
    </li>
  );
}

export function RecentFlightsBox({ flights, failed }: Props) {
  const header = <CardHeader title="Recent flights" />;
  const footer = (
    <CardFooterLink
      to="/flight-history"
      icon={FaClockRotateLeft}
      title="Flight history"
      description="See all past flights"
    />
  );

  if (failed) {
    return (
      <Container padding="condensed" header={header} footer={footer}>
        <TilePlaceholder
          icon={FaTriangleExclamation}
          hint="Your recent flights could not be loaded. Reload the page to try again."
        />
      </Container>
    );
  }

  if (flights.length === 0) {
    return (
      <Container padding="condensed" header={header}>
        <EmptyState
          icon={LuPlaneLanding}
          title="No finished flights yet"
          description="Each flight shows here once it closes."
        />
      </Container>
    );
  }

  return (
    <Container padding="none" header={header} footer={footer}>
      <ol className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] gap-x-3 divide-y divide-gray-100 py-1 dark:divide-gray-800">
        {flights.map((flight) => (
          <RecentFlightRow key={flight.id} flight={flight} />
        ))}
      </ol>
    </Container>
  );
}
