import React from "react";
import { twMerge } from "tailwind-merge";
import type { Timesheet } from "~/features/flight";
import { arrivalPunctuality, type Punctuality } from "~/features/flight/lib/flightRecord";

const TONES: Record<Punctuality["kind"], string> = {
  on_time: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  early: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  late: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
};

function Figure({ children }: { children: string }) {
  return <span className="me-1 font-mono normal-case tracking-normal">{children}</span>;
}

function Description({ punctuality }: { punctuality: Punctuality }) {
  switch (punctuality.kind) {
    case "on_time":
      return <>On time</>;
    case "late":
      return (
        <>
          <Figure>{`+${punctuality.minutes}m`}</Figure>late
        </>
      );
    case "early":
      return (
        <>
          <Figure>{`${punctuality.minutes}m`}</Figure>early
        </>
      );
  }
}

type Props = {
  timesheet: Timesheet;
  className?: string;
};

export function ArrivalPunctualityBadge({ timesheet, className }: Props) {
  const punctuality = arrivalPunctuality(timesheet);

  if (punctuality === null) {
    return null;
  }

  return (
    <span
      title="On-block against schedule"
      className={twMerge(
        "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-2xs font-bold uppercase tracking-wide",
        TONES[punctuality.kind],
        className,
      )}
    >
      <Description punctuality={punctuality} />
    </span>
  );
}
