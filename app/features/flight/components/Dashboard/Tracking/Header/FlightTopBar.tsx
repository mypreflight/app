import React from "react";
import { twMerge } from "tailwind-merge";
import { AircraftRegistrationLink } from "~/features/aircraft/components/Aircraft/AircraftRegistrationLink";
import type { Flight } from "~/features/flight";
import { TrackingViewSwitch } from "~/features/flight/components/Dashboard/Tracking/Header/TrackingViewSwitch";
import { TimeCertaintyMark } from "~/features/flight/components/Dashboard/Tracking/TimeCertaintyMark";
import type { TrackingViewState } from "~/features/flight/hooks/useTrackingView";
import { blockTimeSummary } from "~/features/flight/lib/blockEvents";
import { OperatorFin } from "~/features/operator/components/OperatorFin";
import { formatDuration } from "~/shared/lib/time";

type Props = {
  flight: Flight;
  diverted: boolean;
  trackingView: TrackingViewState;
};

const STRUCK = "text-gray-500 line-through decoration-2 dark:text-gray-400";

export function FlightTopBar({ flight, diverted, trackingView }: Props) {
  const block = blockTimeSummary(flight.timesheet);
  const { departureAirport, destinationAirport, aircraft } = flight;

  return (
    <>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3.5 gap-y-1">
        <span className="size-5 shrink-0">
          <OperatorFin operator={flight.operator} />
        </span>
        <h1 className="whitespace-nowrap font-mono text-lg font-bold leading-none text-gray-900 dark:text-white">
          {flight.flightNumber}
        </h1>
        <span className="whitespace-nowrap font-mono text-[0.9375rem] font-bold leading-none text-gray-900 dark:text-white">
          {departureAirport.iataCode}
          <span aria-hidden={true}> – </span>
          <span className="sr-only"> to </span>
          <span className={twMerge(diverted && STRUCK)}>{destinationAirport.iataCode}</span>
        </span>
        <span className="flex items-center gap-2 whitespace-nowrap text-[0.8125rem] text-gray-700 dark:text-gray-300">
          {departureAirport.city.name}
          <span
            title="Block time"
            className="flex items-center gap-1.5 font-mono text-xs font-semibold tabular-nums text-gray-500 dark:text-gray-400"
          >
            <span className="w-6 border-t border-dashed border-gray-300 dark:border-gray-600" aria-hidden={true} />
            <span className="sr-only">Block time</span>
            {block.provenance !== "actual" && <TimeCertaintyMark certainty={block.provenance} />}
            {formatDuration(block.minutes)}
            <span className="w-6 border-t border-dashed border-gray-300 dark:border-gray-600" aria-hidden={true} />
          </span>
          <span className={twMerge(diverted && STRUCK)}>{destinationAirport.city.name}</span>
        </span>
        <span className="size-1 shrink-0 rounded-full bg-gray-400 dark:bg-gray-600" aria-hidden={true} />
        <span className="whitespace-nowrap text-[0.8125rem] text-gray-500 dark:text-gray-400">
          <AircraftRegistrationLink
            aircraftId={aircraft.id}
            registration={aircraft.registration}
            className="font-mono font-bold text-gray-700 hover:text-indigo-700 hover:underline dark:text-gray-300 dark:hover:text-indigo-300"
          />{" "}
          ({aircraft.airframe.name})
        </span>
      </div>
      <TrackingViewSwitch trackingView={trackingView} size="sm" className="shrink-0" />
    </>
  );
}
