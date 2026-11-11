import { BLOCK_EVENTS, type BlockEventKey } from "~/features/flight/lib/blockEvents";
import type { Loadsheets, Schedule, Timesheet } from "~/features/flight/model";
import { getTimeDifferenceInMinutes } from "~/shared/lib/time";

const ON_TIME_TOLERANCE_MINUTES = 5;

export type BlockEventRecord = {
  key: BlockEventKey;
  label: string;
  actual: Date | null;
  scheduled: Date;
  deltaMinutes: number | null;
};

export type Punctuality = { kind: "on_time" } | { kind: "late"; minutes: number } | { kind: "early"; minutes: number };

export type FuelRecord = {
  burned: number | null;
  plannedTrip: number | null;
  deltaTonnes: number | null;
};

function actualOf(timesheet: Timesheet, key: BlockEventKey): Date | null {
  return (timesheet.actual as Schedule | undefined)?.[key] ?? null;
}

export function blockEventRecords(timesheet: Timesheet): BlockEventRecord[] {
  return BLOCK_EVENTS.map(({ key, label }) => {
    const actual = actualOf(timesheet, key);
    const scheduled = timesheet.scheduled[key];

    return {
      key,
      label,
      actual,
      scheduled,
      deltaMinutes: actual === null ? null : getTimeDifferenceInMinutes(scheduled, actual),
    };
  });
}

export function arrivalPunctuality(timesheet: Timesheet): Punctuality | null {
  const actual = actualOf(timesheet, "onBlockTime");

  if (actual === null) {
    return null;
  }

  const minutes = getTimeDifferenceInMinutes(timesheet.scheduled.onBlockTime, actual);

  if (Math.abs(minutes) <= ON_TIME_TOLERANCE_MINUTES) {
    return { kind: "on_time" };
  }

  return minutes > 0 ? { kind: "late", minutes } : { kind: "early", minutes: -minutes };
}

export function fuelRecord(actualFuelBurned: number | null, loadsheets: Loadsheets): FuelRecord {
  const plannedTrip = loadsheets.final?.fuel?.trip ?? loadsheets.preliminary?.fuel?.trip ?? null;

  return {
    burned: actualFuelBurned,
    plannedTrip,
    deltaTonnes: actualFuelBurned === null || plannedTrip === null ? null : actualFuelBurned - plannedTrip,
  };
}

export function formatTonnes(value: number): string {
  return String(Number(value.toFixed(3)));
}

export function formatSignedTonnes(value: number): string {
  const rounded = Number(value.toFixed(3));

  if (rounded === 0) {
    return "0";
  }

  return rounded > 0 ? `+${rounded}` : `−${-rounded}`;
}

export function formatSignedMinutes(minutes: number): string {
  if (minutes === 0) {
    return "0m";
  }

  return minutes > 0 ? `+${minutes}m` : `−${-minutes}m`;
}
