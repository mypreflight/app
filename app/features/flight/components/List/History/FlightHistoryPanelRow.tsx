import React, { memo } from "react";
import { FaArrowRight } from "react-icons/fa";
import { HiChevronRight } from "react-icons/hi";
import { Link } from "react-router";
import type { Flight } from "~/features/flight";
import { listOffBlockTimeOf } from "~/features/flight/lib/flightListTimes";
import { historyFlightPath } from "~/features/flight/lib/historyView";
import { OperatorFin } from "~/features/operator/components/OperatorFin";
import { dateToIcaoDate } from "~/shared/ui/Date/FormattedIcaoDate";

type Props = {
  flight: Flight;
  highlighted: boolean;
  onHover: (flightId: string | null) => void;
  onOpen: (flight: Flight) => void;
};

function isPlainClick(event: React.MouseEvent): boolean {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

export const FlightHistoryPanelRow = memo(function FlightHistoryPanelRow({
  flight,
  highlighted,
  onHover,
  onOpen,
}: Props) {
  const { departureAirport, destinationAirport } = flight;
  const flownOn = dateToIcaoDate(listOffBlockTimeOf(flight));

  return (
    <li>
      <Link
        to={historyFlightPath(flight.id)}
        prefetch="intent"
        aria-label={`${flight.flightNumber}, ${departureAirport.iataCode} to ${destinationAirport.iataCode}, ${flownOn}`}
        data-highlighted={highlighted || undefined}
        onClick={(event) => {
          if (!isPlainClick(event)) return;
          event.preventDefault();
          onOpen(flight);
        }}
        onMouseEnter={() => onHover(flight.id)}
        onMouseLeave={() => onHover(null)}
        onFocus={() => onHover(flight.id)}
        onBlur={() => onHover(null)}
        className="grid grid-cols-[2rem_minmax(0,1fr)_auto_1rem] items-center gap-x-3 ps-4 pe-3 py-2.5 transition-colors outline-none hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 data-highlighted:bg-gray-50 motion-reduce:transition-none dark:hover:bg-gray-800/60 dark:focus-visible:bg-gray-800/60 dark:focus-visible:ring-indigo-400 dark:data-highlighted:bg-gray-800/60 pointer-coarse:py-3"
      >
        <span className="flex size-8 items-center justify-center">
          <OperatorFin operator={flight.operator} />
        </span>
        <span className="min-w-0">
          <span className="block truncate font-mono text-sm font-bold text-gray-900 dark:text-white">
            {flight.flightNumber}
          </span>
          <span className="mt-0.5 flex items-center gap-1.5 font-mono text-xs text-gray-600 dark:text-gray-300">
            {departureAirport.iataCode}
            <FaArrowRight aria-hidden={true} size={9} className="shrink-0 text-gray-500 dark:text-gray-400" />
            {destinationAirport.iataCode}
          </span>
        </span>
        <span className="self-start pt-0.5 font-mono text-xs tabular-nums text-gray-500 dark:text-gray-400">
          {flownOn}
        </span>
        <HiChevronRight aria-hidden={true} className="size-4 shrink-0 text-gray-500 dark:text-gray-400" />
      </Link>
    </li>
  );
});
