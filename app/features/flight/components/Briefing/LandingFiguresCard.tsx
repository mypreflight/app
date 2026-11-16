import React from "react";
import { twMerge } from "tailwind-merge";
import { fixName } from "~/features/route/lib/fixName";
import { ABSENT, formatSignedTonnesFromKilograms, formatTonnesFromKilograms } from "~/features/route/lib/routeFigures";
import type { PlannedRouteFix } from "~/features/route/model";
import { dateToIcaoTime } from "~/shared/ui/Date/FormattedIcaoTime";
import { CardHeader } from "~/shared/ui/Layout/CardHeader";
import { Container } from "~/shared/ui/Layout/Container";

type Props = {
  destination: PlannedRouteFix;
  lastReport: PlannedRouteFix | null;
  zeroFuelWeightKg: number | null;
  topOfDescent: Date | null;
};

function correction(report: PlannedRouteFix | null): number | null {
  const actual = report?.fuelReport?.actualOnBoard ?? null;
  const planned = report?.fuel.plannedOnBoard ?? null;

  return actual === null || planned === null ? null : actual - planned;
}

export function LandingFiguresCard({ destination, lastReport, zeroFuelWeightKg, topOfDescent }: Props) {
  const planned = destination.fuel.plannedOnBoard;
  const minimum = destination.fuel.minimumOnBoard;
  const delta = correction(lastReport);
  const expected = planned === null ? null : planned + (delta ?? 0);
  const margin = expected === null || minimum === null ? null : expected - minimum;
  const landingWeight = expected === null || zeroFuelWeightKg === null ? null : zeroFuelWeightKg + expected;

  return (
    <Container
      padding="condensed"
      header={
        <CardHeader
          title="Landing figures"
          actions={
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {delta === null || lastReport === null
                ? "From the nav log"
                : `From the ${fixName(lastReport.ident)} report`}
            </span>
          }
        />
      }
    >
      <dl className="flex flex-col text-sm">
        <Line label={`Planned at ${fixName(destination.ident)}`} value={formatTonnesFromKilograms(planned)} />
        {delta !== null && lastReport !== null && (
          <Line label={`Last report, ${fixName(lastReport.ident)}`} value={formatSignedTonnesFromKilograms(delta)} />
        )}
        {delta !== null && <Line label="Expected on landing" value={formatTonnesFromKilograms(expected)} strong />}
        <Line label={`Minimum at ${fixName(destination.ident)}`} value={formatTonnesFromKilograms(minimum)} />
        <Line
          label="Margin"
          value={margin === null ? ABSENT : formatTonnesFromKilograms(margin)}
          strong
          tone={margin !== null && margin < 0 ? "text-red-700 dark:text-red-400" : undefined}
        />
        <Line label="Estimated landing weight" value={formatTonnesFromKilograms(landingWeight)} />
        {topOfDescent !== null && (
          <Line label="Top of descent" value={`${dateToIcaoTime(topOfDescent)}Z`} unit={null} />
        )}
      </dl>
    </Container>
  );
}

type LineProps = {
  label: string;
  value: string;
  strong?: boolean;
  tone?: string;
  unit?: string | null;
};

function Line({ label, value, strong = false, tone, unit = "t" }: LineProps) {
  return (
    <div
      className={twMerge(
        "flex items-baseline justify-between gap-3 py-1",
        strong && "mt-1 border-t border-gray-200 pt-2 dark:border-gray-700",
      )}
    >
      <dt className={twMerge(strong && "font-semibold text-gray-900 dark:text-white")}>{label}</dt>
      <dd className={twMerge("font-mono tabular-nums text-gray-900 dark:text-white", strong && "font-bold", tone)}>
        {value}
        {value !== ABSENT && unit !== null && (
          <span className="ms-0.5 text-xs font-normal text-gray-500 dark:text-gray-400">{unit}</span>
        )}
      </dd>
    </div>
  );
}
