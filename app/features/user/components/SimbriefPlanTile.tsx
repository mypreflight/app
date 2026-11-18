import React from "react";
import { FaPlaneDeparture } from "react-icons/fa6";
import { AircraftImage } from "~/features/aircraft/components/Aircraft/AircraftImage";
import type { SimbriefAirport, SimbriefFlight } from "~/features/user";
import { formatDuration } from "~/shared/lib/time";
import { dateToIcaoDate } from "~/shared/ui/Date/FormattedIcaoDate";
import { FormattedIcaoTime } from "~/shared/ui/Date/FormattedIcaoTime";
import { AirportEndpoint } from "~/shared/ui/Display/AirportEndpoint";
import { StatBlock } from "~/shared/ui/Display/StatBlock";

type Props = {
  plan: SimbriefFlight;
};

const MINUTE_MS = 60_000;

function Endpoint({ airport, align }: { airport: SimbriefAirport; align?: "left" | "right" }) {
  return (
    <AirportEndpoint
      iataCode={airport.iataCode ?? airport.icaoCode}
      subtitle={airport.city ?? airport.name ?? undefined}
      align={align}
    />
  );
}

function TimeStat({ label, date, align }: { label: string; date: Date | null; align?: "left" | "right" }) {
  if (date === null) {
    return <StatBlock label={label} value="—" align={align} />;
  }

  return (
    <StatBlock label={label} value={<FormattedIcaoTime date={date} />} meta={dateToIcaoDate(date)} align={align} />
  );
}

function toDate(value: string | null): Date | null {
  return value === null ? null : new Date(value);
}

export function SimbriefPlanTile({ plan }: Props) {
  const { origin, destination, aircraft, scheduledOffBlockTime, scheduledOnBlockTime, generatedAt } = plan;
  const offBlock = toDate(scheduledOffBlockTime);
  const onBlock = toDate(scheduledOnBlockTime);
  const generated = toDate(generatedAt);
  const blockMinutes =
    offBlock !== null && onBlock !== null ? Math.round((onBlock.getTime() - offBlock.getTime()) / MINUTE_MS) : null;
  const aircraftType = aircraft.type ?? null;

  return (
    <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-800">
      <div className="pb-4">
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,1fr)] items-start gap-3">
          <Endpoint airport={origin} />
          <div className="mt-3 flex items-center gap-1.5 text-gray-300 dark:text-gray-600">
            <span className="size-1.5 flex-none rounded-full bg-current" />
            <span className="flex-1 border-t border-dashed border-current" />
            <FaPlaneDeparture className="flex-none text-gray-500 dark:text-gray-400" size={15} aria-hidden={true} />
            <span className="flex-1 border-t border-dashed border-current" />
            <span className="size-1.5 flex-none rounded-full bg-current" />
          </div>
          <Endpoint airport={destination} align="right" />
        </div>
        {generated !== null && (
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Generated {dateToIcaoDate(generated)} <FormattedIcaoTime date={generated} />
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 items-start gap-3 py-4">
        <TimeStat label={"Sched. off‑block"} date={offBlock} />
        <div className="text-center">
          {blockMinutes !== null && blockMinutes > 0 && (
            <StatBlock label="Block" value={formatDuration(blockMinutes)} />
          )}
        </div>
        <TimeStat label={"Sched. on‑block"} date={onBlock} align="right" />
      </div>

      <div className="flex items-center gap-4 pt-4">
        {aircraftType !== null && (
          <div className="aspect-[16/9] w-28 shrink-0 overflow-hidden rounded-lg bg-gray-50 dark:bg-gray-800">
            <AircraftImage type={aircraftType} name={aircraft.name ?? undefined} className="h-full" />
          </div>
        )}
        <StatBlock
          label="Aircraft"
          value={aircraft.registration ?? aircraftType ?? "—"}
          meta={aircraft.registration === null ? undefined : (aircraft.name ?? aircraftType ?? undefined)}
        />
      </div>
    </div>
  );
}
