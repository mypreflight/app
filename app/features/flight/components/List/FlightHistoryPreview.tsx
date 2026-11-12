import { Button } from "flowbite-react";
import React from "react";
import { HiArrowRight } from "react-icons/hi";
import { Link } from "react-router";
import { twMerge } from "tailwind-merge";
import type { Flight } from "~/features/flight";
import { ArrivalPunctualityBadge } from "~/features/flight/components/Dashboard/History/Header/ArrivalPunctualityBadge";
import { TrackingRoute } from "~/features/flight/components/Dashboard/Tracking/Header/TrackingRoute";
import { FlightIdentity } from "~/features/flight/components/FlightIdentity";
import { CompactFlightMap } from "~/features/flight/components/Map/Box/CompactFlightMap";
import { useFlightPathCache } from "~/features/flight/hooks/useFlightPathCache";
import { blockEventRecords, describeDeviation, formatTonnes } from "~/features/flight/lib/flightRecord";
import { historyFlightPath } from "~/features/flight/lib/historyView";
import { durationMinutes, formatDuration } from "~/shared/lib/time";
import { FormattedIcaoDate } from "~/shared/ui/Date/FormattedIcaoDate";
import { dateToIcaoTime } from "~/shared/ui/Date/FormattedIcaoTime";
import { FieldLabel } from "~/shared/ui/Display/FieldLabel";

function deltaTone(delta: number): string {
  if (delta > 0) return "text-amber-700 dark:text-amber-400";
  if (delta < 0) return "text-green-700 dark:text-green-400";
  return "text-gray-500 dark:text-gray-400";
}

function Figure({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div>
      <dt>
        <FieldLabel>{label}</FieldLabel>
      </dt>
      <dd className="mt-1 font-mono text-lg font-bold leading-none tabular-nums text-gray-900 dark:text-gray-100">
        {value}
        {unit && <span className="ms-1 text-sm font-normal text-gray-500 dark:text-gray-400">{unit}</span>}
      </dd>
    </div>
  );
}

type Props = {
  flight: Flight;
  className?: string;
};

export function FlightHistoryPreview({ flight, className }: Props) {
  const path = useFlightPathCache(flight);
  const { actual, scheduled } = flight.timesheet;
  const records = blockEventRecords(flight.timesheet);
  const airTime =
    actual?.takeoffTime && actual.arrivalTime ? durationMinutes(actual.takeoffTime, actual.arrivalTime) : null;
  const href = historyFlightPath(flight.id);

  return (
    <aside
      aria-label={`Preview of ${flight.flightNumber}`}
      className={twMerge(
        "flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900",
        className,
      )}
    >
      <CompactFlightMap
        flight={flight}
        path={path}
        href={href}
        label={`Open ${flight.flightNumber}`}
        className="h-60 border-b border-gray-200 dark:border-gray-800"
      />
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <FlightIdentity
            operator={flight.operator}
            flightNumber={flight.flightNumber}
            aircraftId={flight.aircraft.id}
            registration={flight.aircraft.registration}
            size="md"
          />
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              <FormattedIcaoDate date={actual?.offBlockTime ?? scheduled.offBlockTime} />
            </span>
            <ArrivalPunctualityBadge timesheet={flight.timesheet} />
          </div>
        </div>

        <TrackingRoute flight={flight} diverted={flight.isFlightDiverted} />

        <dl className="grid grid-cols-[auto_auto_1fr_auto] items-baseline gap-x-3 border-t border-gray-200 pt-3 text-sm dark:border-gray-800">
          {records.map((record) => (
            <div key={record.key} className="col-span-4 grid grid-cols-subgrid py-1">
              <dt className="text-gray-500 dark:text-gray-400">{record.label}</dt>
              <dd className="font-mono font-bold tabular-nums text-gray-900 dark:text-gray-100">
                {record.actual === null ? "—" : `${dateToIcaoTime(record.actual)}Z`}
              </dd>
              <dd className="text-xs text-gray-500 dark:text-gray-400">
                Sched. <span className="font-mono tabular-nums">{dateToIcaoTime(record.scheduled)}Z</span>
              </dd>
              <dd
                className={twMerge(
                  "text-end font-mono text-xs font-semibold tabular-nums",
                  record.deltaMinutes === null ? "text-gray-500 dark:text-gray-400" : deltaTone(record.deltaMinutes),
                )}
              >
                {record.deltaMinutes === null ? "—" : describeDeviation(record.deltaMinutes)}
              </dd>
            </div>
          ))}
        </dl>

        <dl className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-3 dark:border-gray-800">
          <Figure label="Air time" value={airTime === null ? "—" : formatDuration(airTime)} />
          <Figure
            label="Fuel burned"
            value={flight.actualFuelBurned === null ? "—" : formatTonnes(flight.actualFuelBurned)}
            unit={flight.actualFuelBurned === null ? undefined : "t"}
          />
        </dl>

        <Button as={Link} to={href} viewTransition color="indigo" className="w-full">
          Open flight
          <HiArrowRight className="ms-2 size-4" aria-hidden={true} />
        </Button>
      </div>
    </aside>
  );
}
