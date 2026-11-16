import { Button } from "flowbite-react";
import React, { useState } from "react";
import { twMerge } from "tailwind-merge";
import { BelowMinimumIcon } from "~/features/route/components/FuelReport/BelowMinimumIcon";
import { FixFuelReportModal } from "~/features/route/components/FuelReport/FixFuelReportModal";
import { fixName } from "~/features/route/lib/fixName";
import { fuelReportTone } from "~/features/route/lib/fuelReportStanding";
import {
  ABSENT,
  formatElapsed,
  formatSignedTonnesFromKilograms,
  formatTonnesFromKilograms,
} from "~/features/route/lib/routeFigures";
import type { PlannedRouteFix, ReportFixFuel } from "~/features/route/model";
import { dateToIcaoTime } from "~/shared/ui/Date/FormattedIcaoTime";
import { CardHeader } from "~/shared/ui/Layout/CardHeader";
import { Container } from "~/shared/ui/Layout/Container";

type Props = {
  title: string;
  fixes: PlannedRouteFix[];
  takeoffTime: Date | null;
  canReport: boolean;
  onReport: ReportFixFuel;
};

const CELL = "whitespace-nowrap px-3 py-2";
const NUMBER = `${CELL} text-end font-mono tabular-nums`;

function eta(fix: PlannedRouteFix, takeoffTime: Date | null): string {
  if (takeoffTime === null) {
    return `+${formatElapsed(fix.elapsedSeconds)}`;
  }

  return `${dateToIcaoTime(new Date(takeoffTime.getTime() + fix.elapsedSeconds * 1000))}Z`;
}

function difference(fix: PlannedRouteFix): string {
  const actual = fix.fuelReport?.actualOnBoard ?? null;
  const planned = fix.fuel.plannedOnBoard;

  return actual === null || planned === null ? ABSENT : formatSignedTonnesFromKilograms(actual - planned);
}

export function FixFuelReportsCard({ title, fixes, takeoffTime, canReport, onReport }: Props) {
  const [reporting, setReporting] = useState<PlannedRouteFix | null>(null);
  const reported = fixes.filter((fix) => fix.fuelReport !== null).length;
  const next = canReport ? (fixes.find((fix) => fix.fuelReport === null) ?? null) : null;

  return (
    <Container
      padding="none"
      header={
        <CardHeader
          title={title}
          actions={
            <span className="font-mono text-xs tabular-nums text-gray-500 dark:text-gray-400">
              {reported} of {fixes.length} reported
            </span>
          }
        />
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-gray-700 dark:text-gray-300">
          <thead className="text-2xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th scope="col" className={`${CELL} text-start`}>
                Waypoint
              </th>
              <th scope="col" className={`${CELL} text-end`}>
                ETA
              </th>
              <th scope="col" className={`${CELL} text-end`}>
                Planned
              </th>
              <th scope="col" className={`${CELL} text-end`}>
                Minimum
              </th>
              <th scope="col" className={`${CELL} text-end`}>
                Reported
              </th>
              <th scope="col" className={`${CELL} text-end`}>
                Difference
              </th>
              <th scope="col" className={CELL}>
                <span className="sr-only">Report</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {fixes.map((fix) => {
              const isNext = fix.ordinal === next?.ordinal;
              const canEdit = canReport && (isNext || fix.fuelReport !== null);

              return (
                <tr key={fix.ordinal} className={twMerge(isNext && "bg-indigo-50/70 dark:bg-indigo-500/10")}>
                  <th scope="row" className={`${CELL} text-start font-mono font-bold text-gray-900 dark:text-white`}>
                    {fixName(fix.ident)}
                  </th>
                  <td className={NUMBER}>{eta(fix, takeoffTime)}</td>
                  <td className={NUMBER}>{formatTonnesFromKilograms(fix.fuel.plannedOnBoard)}</td>
                  <td className={`${NUMBER} text-gray-500 dark:text-gray-400`}>
                    {formatTonnesFromKilograms(fix.fuel.minimumOnBoard)}
                  </td>
                  <td className={`${NUMBER} font-bold text-gray-900 dark:text-white`}>
                    {formatTonnesFromKilograms(fix.fuelReport?.actualOnBoard ?? null)}
                  </td>
                  <td className={twMerge(NUMBER, fuelReportTone(fix))}>
                    <BelowMinimumIcon fix={fix} />
                    {difference(fix)}
                  </td>
                  <td className={`${CELL} text-end`}>
                    {canEdit && (
                      <Button color={isNext ? "indigo" : "alternative"} size="xs" onClick={() => setReporting(fix)}>
                        {fix.fuelReport === null ? "Report" : "Update"}
                        <span className="sr-only"> fuel at {fixName(fix.ident)}</span>
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {reporting !== null && (
        <FixFuelReportModal
          fix={reporting}
          takeoffTime={takeoffTime}
          onReport={onReport}
          close={() => setReporting(null)}
        />
      )}
    </Container>
  );
}
