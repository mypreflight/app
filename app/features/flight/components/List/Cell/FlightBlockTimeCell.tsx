import React from "react";
import type { Flight } from "~/features/flight";
import { actualScheduleOf, airMinutesOf, blockMinutesOf } from "~/features/flight/lib/flightListTimes";
import { formatDuration } from "~/shared/lib/time";

type Props = {
  flight: Flight;
};

export function blockTimeLabelOf(flight: Flight): string {
  const actual = actualScheduleOf(flight);
  if (actual === null) return "block time unavailable";

  return `block ${formatDuration(blockMinutesOf(actual))}, air ${formatDuration(airMinutesOf(actual))}`;
}

export function FlightBlockTimeCell({ flight }: Props) {
  const actual = actualScheduleOf(flight);

  if (actual === null) {
    return <span className="block px-1.5 py-2.5 text-sm text-gray-500 @xl:px-3 dark:text-gray-400">—</span>;
  }

  return (
    <span className="block min-w-0 px-1 py-2.5 @xl:px-3">
      <span className="block font-mono text-sm font-bold tabular-nums text-gray-900 dark:text-white">
        {formatDuration(blockMinutesOf(actual))}
      </span>
      <span className="mt-0.5 block font-mono text-xs tabular-nums text-gray-500 dark:text-gray-400">
        Air {formatDuration(airMinutesOf(actual))}
      </span>
    </span>
  );
}
