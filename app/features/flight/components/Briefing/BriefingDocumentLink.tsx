import { Button, Tooltip } from "flowbite-react";
import React, { type ReactNode } from "react";
import { Link } from "react-router";
import type { BriefingDocument } from "~/features/flight/lib/briefingPhase";

export type BriefingDocumentEntry = {
  document: BriefingDocument;
  label: string;
  href: string | null;
  unavailableReason?: string;
};

export const OPENED_FROM_BRIEFING = { openedFromBriefing: true };

type Props = {
  entry: BriefingDocumentEntry;
  size: "xs" | "sm";
  icon?: ReactNode;
};

export function BriefingDocumentLink({ entry, size, icon }: Props) {
  const content = (
    <>
      {icon}
      {entry.label}
    </>
  );

  if (entry.href === null) {
    const disabled = (
      <Button color="alternative" size={size} disabled>
        {content}
      </Button>
    );

    return entry.unavailableReason === undefined ? (
      disabled
    ) : (
      <Tooltip content={entry.unavailableReason}>
        <span>{disabled}</span>
      </Tooltip>
    );
  }

  return (
    <Button
      as={Link}
      to={entry.href}
      state={OPENED_FROM_BRIEFING}
      id={`briefing-document-${entry.document}`}
      color="alternative"
      size={size}
    >
      {content}
    </Button>
  );
}
