import React from "react";
import { SimbriefPdfButton } from "~/features/flight/components/Briefing/SimbriefPdfButton";
import type { SimbriefIssue } from "~/features/flight/lib/simbriefIssue";
import { FormattedIcaoDate } from "~/shared/ui/Date/FormattedIcaoDate";
import { FormattedIcaoTime } from "~/shared/ui/Date/FormattedIcaoTime";
import { FormSectionLabel } from "~/shared/ui/Form/FormSectionLabel";

type Props = {
  label: string;
  issueLabel: string;
  issue: SimbriefIssue | null;
  pdfUrl: string | null;
};

export function BriefingDocumentSummary({ label, issueLabel, issue, pdfUrl }: Props) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div className="flex flex-col gap-0.5">
        <FormSectionLabel>{label}</FormSectionLabel>
        {issue !== null && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {issueLabel} {issue.number}, issued <FormattedIcaoDate date={issue.issuedAt} />{" "}
            <FormattedIcaoTime date={issue.issuedAt} />
          </p>
        )}
      </div>
      {pdfUrl !== null && pdfUrl !== "" && <SimbriefPdfButton url={pdfUrl} />}
    </div>
  );
}
