import { Button, Tooltip } from "flowbite-react";
import React, { type ReactNode } from "react";
import { FaPlaneCircleExclamation, FaTriangleExclamation } from "react-icons/fa6";
import { twMerge } from "tailwind-merge";
import {
  type BriefingDocumentEntry,
  BriefingDocumentLink,
} from "~/features/flight/components/Briefing/BriefingDocumentLink";
import { FieldLabel } from "~/shared/ui/Display/FieldLabel";

type Props = {
  load: BriefingDocumentEntry[];
  records: BriefingDocumentEntry[];
  canDeclareEmergency: boolean;
  canReportDiversion: boolean;
  onDeclareEmergency: () => void;
  onReportDiversion: () => void;
  className?: string;
};

const ACTIONS_WINDOW = "Available only between off-block and on-block.";

export function BriefingRecordsStrip({
  load,
  records,
  canDeclareEmergency,
  canReportDiversion,
  onDeclareEmergency,
  onReportDiversion,
  className,
}: Props) {
  return (
    <section
      aria-label="Load, records and abnormal situations"
      className={twMerge("flex flex-wrap items-center gap-x-1.5 gap-y-2", className)}
    >
      <Group label="Load" entries={load} />
      <span className="mx-2 h-5 w-px bg-gray-200 max-sm:hidden dark:bg-gray-800" aria-hidden={true} />
      <Group label="Records" entries={records} />
      <div className="ms-auto flex flex-wrap gap-1.5">
        <Guarded enabled={canDeclareEmergency}>
          <Button color="red" outline size="xs" onClick={onDeclareEmergency} disabled={!canDeclareEmergency}>
            <FaTriangleExclamation className="me-1.5" aria-hidden={true} />
            Declare emergency
          </Button>
        </Guarded>
        <Guarded enabled={canReportDiversion}>
          <Button color="red" outline size="xs" onClick={onReportDiversion} disabled={!canReportDiversion}>
            <FaPlaneCircleExclamation className="me-1.5" aria-hidden={true} />
            Report diversion
          </Button>
        </Guarded>
      </div>
    </section>
  );
}

function Group({ label, entries }: { label: string; entries: BriefingDocumentEntry[] }) {
  return (
    <>
      <FieldLabel className="me-1">{label}</FieldLabel>
      {entries.map((entry) => (
        <BriefingDocumentLink key={entry.document} entry={entry} size="xs" />
      ))}
    </>
  );
}

function Guarded({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  return enabled ? (
    children
  ) : (
    <Tooltip content={ACTIONS_WINDOW}>
      <span>{children}</span>
    </Tooltip>
  );
}
