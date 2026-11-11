import { Button } from "flowbite-react";
import React, { useState } from "react";
import { twMerge } from "tailwind-merge";
import { FIX_GRID, FixFigure } from "~/features/route/components/Chart/FixFigure";
import { BelowMinimumIcon } from "~/features/route/components/FuelReport/BelowMinimumIcon";
import { FixFuelReportModal } from "~/features/route/components/FuelReport/FixFuelReportModal";
import { fixName } from "~/features/route/lib/fixName";
import { fuelReportTone } from "~/features/route/lib/fuelReportStanding";
import { ABSENT, formatSignedTonnesFromKilograms, formatTonnesFromKilograms } from "~/features/route/lib/routeFigures";
import type { PlannedRouteFix, ReportFixFuel } from "~/features/route/model";
import { dateToIcaoTime } from "~/shared/ui/Date/FormattedIcaoTime";

type Props = {
  fix: PlannedRouteFix;
  canReport: boolean;
  takeoffTime: Date | null;
  onReport?: ReportFixFuel;
};

export function FixFuelReport({ fix, canReport, takeoffTime, onReport }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const actualOnBoard = fix.fuelReport?.actualOnBoard ?? null;
  const reportedAt = fix.fuelReport === null ? ABSENT : dateToIcaoTime(new Date(fix.fuelReport.reportedAt));
  const plannedOnBoard = fix.fuel.plannedOnBoard;
  const canEdit = canReport && onReport !== undefined;
  const action = actualOnBoard === null ? "Report" : "Update";
  const tone = fuelReportTone(fix);

  if (actualOnBoard === null && !canEdit) {
    return null;
  }

  return (
    <div className={twMerge(FIX_GRID, "items-center")}>
      <dl aria-live="polite" className="col-span-2 grid grid-cols-subgrid gap-y-1.5 min-[360px]:col-span-3">
        <FixFigure
          label="Actual"
          value={formatTonnesFromKilograms(actualOnBoard)}
          suffix="t"
          icon={<BelowMinimumIcon fix={fix} />}
          valueClassName={tone}
        />
        {plannedOnBoard !== null && (
          <FixFigure
            label="Against EFOB"
            value={actualOnBoard === null ? ABSENT : formatSignedTonnesFromKilograms(actualOnBoard - plannedOnBoard)}
            suffix="t"
            valueClassName={tone}
          />
        )}
        <FixFigure label="Time" value={reportedAt} suffix="Z" />
      </dl>
      {canEdit && (
        <>
          <Button
            type="button"
            size="xs"
            color="alternative"
            aria-label={`${action} actual fuel at ${fixName(fix.ident)}`}
            className="col-span-2 justify-self-end pointer-coarse:h-11 min-[360px]:col-span-1"
            onClick={() => setIsModalOpen(true)}
          >
            {action}
          </Button>
          {isModalOpen && (
            <FixFuelReportModal
              fix={fix}
              takeoffTime={takeoffTime}
              onReport={onReport}
              close={() => setIsModalOpen(false)}
            />
          )}
        </>
      )}
    </div>
  );
}
