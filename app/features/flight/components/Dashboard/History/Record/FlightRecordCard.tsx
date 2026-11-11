import React from "react";
import { twMerge } from "tailwind-merge";
import type { Flight, Loadsheets } from "~/features/flight";
import {
  type BlockEventRecord,
  blockEventRecords,
  type FuelRecord,
  formatSignedMinutes,
  formatSignedTonnes,
  formatTonnes,
  fuelRecord,
} from "~/features/flight/lib/flightRecord";
import { durationMinutes, formatDuration } from "~/shared/lib/time";
import { dateToIcaoDate } from "~/shared/ui/Date/FormattedIcaoDate";
import { dateToIcaoTime } from "~/shared/ui/Date/FormattedIcaoTime";
import { FieldLabel } from "~/shared/ui/Display/FieldLabel";
import { Container } from "~/shared/ui/Layout/Container";

function deltaTone(delta: number): string {
  if (delta > 0) return "text-amber-700 dark:text-amber-400";
  if (delta < 0) return "text-green-700 dark:text-green-400";
  return "text-gray-500 dark:text-gray-400";
}

function isSameUtcDay(a: Date, b: Date): boolean {
  return a.toISOString().slice(0, 10) === b.toISOString().slice(0, 10);
}

function ClockTime({ date, referenceDay }: { date: Date; referenceDay: Date }) {
  return (
    <>
      {dateToIcaoTime(date)}
      <span className="text-sm">Z</span>
      {!isSameUtcDay(date, referenceDay) && (
        <span className="ms-1.5 text-xs font-normal text-gray-500 dark:text-gray-400">{dateToIcaoDate(date)}</span>
      )}
    </>
  );
}

function BlockEventFigure({ record, referenceDay }: { record: BlockEventRecord; referenceDay: Date }) {
  return (
    <div className="min-w-0">
      <dt>
        <FieldLabel>{record.label}</FieldLabel>
      </dt>
      <dd className="mt-1">
        <span className="block whitespace-nowrap font-mono text-xl font-bold leading-none tabular-nums text-gray-900 dark:text-gray-100">
          {record.actual === null ? "—" : <ClockTime date={record.actual} referenceDay={referenceDay} />}
        </span>
        <span className="mt-1.5 flex flex-wrap gap-x-1.5 text-xs text-gray-500 dark:text-gray-400">
          <span className="whitespace-nowrap">
            Sched. <span className="font-mono tabular-nums">{dateToIcaoTime(record.scheduled)}Z</span>
          </span>
          {record.deltaMinutes !== null && (
            <span
              className={twMerge(
                "whitespace-nowrap font-mono font-semibold tabular-nums",
                deltaTone(record.deltaMinutes),
              )}
            >
              {formatSignedMinutes(record.deltaMinutes)}
            </span>
          )}
        </span>
      </dd>
    </div>
  );
}

function durationBetween(start: Date | null | undefined, end: Date | null | undefined): string {
  return start && end ? formatDuration(durationMinutes(start, end)) : "—";
}

function BlockTimeFigure({ flight, className }: { flight: Flight; className?: string }) {
  const { actual, scheduled } = flight.timesheet;

  return (
    <div className={className}>
      <FieldLabel>Block time</FieldLabel>
      <span className="mt-1 block whitespace-nowrap font-mono text-3xl font-bold leading-none tabular-nums text-gray-900 dark:text-gray-100">
        {durationBetween(actual?.offBlockTime, actual?.onBlockTime)}
      </span>
      <span className="mt-1.5 flex flex-wrap gap-x-3 text-xs text-gray-500 dark:text-gray-400">
        <span className="whitespace-nowrap">
          Air time{" "}
          <span className="font-mono tabular-nums text-gray-700 dark:text-gray-200">
            {durationBetween(actual?.takeoffTime, actual?.arrivalTime)}
          </span>
        </span>
        <span className="whitespace-nowrap">
          Sched.{" "}
          <span className="font-mono tabular-nums text-gray-700 dark:text-gray-200">
            {durationBetween(scheduled.offBlockTime, scheduled.onBlockTime)}
          </span>
        </span>
      </span>
    </div>
  );
}

function FuelFigure({ fuel, className }: { fuel: FuelRecord; className?: string }) {
  return (
    <div className={className}>
      <FieldLabel>Fuel burned</FieldLabel>
      <span className="mt-1 block whitespace-nowrap font-mono text-3xl font-bold leading-none tabular-nums text-gray-900 dark:text-gray-100">
        {fuel.burned === null ? (
          "—"
        ) : (
          <>
            {formatTonnes(fuel.burned)}
            <span className="ms-1 text-base font-normal text-gray-500 dark:text-gray-400">t</span>
          </>
        )}
      </span>
      <span className="mt-1.5 flex flex-wrap gap-x-1.5 text-xs text-gray-500 dark:text-gray-400">
        {fuel.plannedTrip === null ? (
          <span>{fuel.burned === null ? "Not recorded" : "No planned trip fuel"}</span>
        ) : (
          <span className="whitespace-nowrap">
            Planned trip{" "}
            <span className="font-mono tabular-nums text-gray-700 dark:text-gray-200">
              {formatTonnes(fuel.plannedTrip)} t
            </span>
          </span>
        )}
        {fuel.deltaTonnes !== null && (
          <span
            className={twMerge("whitespace-nowrap font-mono font-semibold tabular-nums", deltaTone(fuel.deltaTonnes))}
          >
            {formatSignedTonnes(fuel.deltaTonnes)} t
          </span>
        )}
      </span>
    </div>
  );
}

type Props = {
  flight: Flight;
  loadsheets: Loadsheets;
  className?: string;
};

export function FlightRecordCard({ flight, loadsheets, className }: Props) {
  const records = blockEventRecords(flight.timesheet);
  const referenceDay = records[0].actual ?? records[0].scheduled;
  const fuel = fuelRecord(flight.actualFuelBurned, loadsheets);

  return (
    <Container padding="spacious" className={twMerge("@container", className)}>
      <h2 className="sr-only">Flight record</h2>
      <div className="grid grid-cols-2 gap-x-6 gap-y-5 @2xl:grid-cols-4 @5xl:grid-cols-[repeat(4,minmax(0,1fr))_auto_auto]">
        <dl className="contents">
          {records.map((record) => (
            <BlockEventFigure key={record.key} record={record} referenceDay={referenceDay} />
          ))}
        </dl>
        <BlockTimeFigure
          flight={flight}
          className="border-t border-gray-200 pt-5 @2xl:col-span-2 @5xl:col-span-1 @5xl:border-t-0 @5xl:border-s @5xl:pt-0 @5xl:ps-6 dark:border-gray-800"
        />
        <FuelFigure
          fuel={fuel}
          className="border-t border-gray-200 pt-5 @2xl:col-span-2 @5xl:col-span-1 @5xl:border-t-0 @5xl:pt-0 dark:border-gray-800"
        />
      </div>
    </Container>
  );
}
