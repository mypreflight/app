import React, { type ReactNode } from "react";
import { FaPlaneCircleExclamation } from "react-icons/fa6";
import type { Diversion } from "~/features/diversion";
import { diversionReasonLabel, diversionSeverityLabel } from "~/features/diversion/components/diversionLabels";
import { dateToZuluStamp } from "~/shared/ui/Date/zuluStamp";

type Props = {
  diversion: Diversion;
};

export function DiversionNotice({ diversion }: Props) {
  return (
    <section className="flex flex-col gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 dark:border-red-900/60 dark:bg-red-900/20">
      <h3 className="flex min-w-0 items-baseline gap-2 text-sm font-bold text-red-700 dark:text-red-400">
        <FaPlaneCircleExclamation aria-hidden={true} size={15} className="shrink-0 self-center" />
        <span>Diverting to</span>
        <span className="font-mono text-gray-900 dark:text-white">{diversion.airport.iataCode}</span>
        <span className="min-w-0 truncate font-normal text-gray-700 dark:text-gray-200">{diversion.airport.name}</span>
      </h3>
      <dl className="grid grid-cols-[repeat(auto-fit,minmax(7rem,1fr))] gap-3">
        <DiversionFact label="Severity">{diversionSeverityLabel(diversion.severity)}</DiversionFact>
        <DiversionFact label="Reason">{diversionReasonLabel(diversion.reason)}</DiversionFact>
        <DiversionFact label="ETA">
          <span className="font-mono">{dateToZuluStamp(diversion.estimatedTimeAtDestination)}</span>
        </DiversionFact>
      </dl>
    </section>
  );
}

function DiversionFact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-400">{label}</dt>
      <dd className="text-sm text-gray-900 dark:text-gray-100">{children}</dd>
    </div>
  );
}
