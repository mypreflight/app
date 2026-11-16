import React from "react";
import { LuFileText } from "react-icons/lu";
import {
  type BriefingDocumentEntry,
  BriefingDocumentLink,
} from "~/features/flight/components/Briefing/BriefingDocumentLink";

type Props = {
  documents: BriefingDocumentEntry[];
};

export function BriefingDocumentButtons({ documents }: Props) {
  return (
    <nav aria-label="Flight documents" className="flex flex-wrap gap-2">
      {documents.map((entry) => (
        <BriefingDocumentLink
          key={entry.document}
          entry={entry}
          size="sm"
          icon={<LuFileText className="me-1.5 size-4" aria-hidden={true} />}
        />
      ))}
    </nav>
  );
}
