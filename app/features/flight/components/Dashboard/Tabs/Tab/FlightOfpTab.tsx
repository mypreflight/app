import React from "react";
import { BriefingDocumentSummary } from "~/features/flight/components/Briefing/BriefingDocumentSummary";
import { BriefingDocumentText } from "~/features/flight/components/Briefing/BriefingDocumentText";
import { useFlightOfp } from "~/features/flight/hooks/useFlightOfp";
import { useTrackedFlight } from "~/features/flight/hooks/useTrackedFlight";
import { ofpIssue } from "~/features/flight/lib/simbriefIssue";
import { Container } from "~/shared/ui/Layout/Container";
import { RawHtml } from "~/shared/ui/RawHtml";

function unescapeOFP(html: string): string {
  return html
    .replace(/\\n/g, "<br />")
    .replace(/\\toHuman/g, "&nbsp;&nbsp;&nbsp;&nbsp;")
    .replace(/\\r/g, "");
}

export function FlightOfpTab() {
  const { flight } = useTrackedFlight();
  const { ofp } = useFlightOfp(flight?.id ?? null);

  if (!flight || !ofp) {
    return null;
  }

  return (
    <div className="flex flex-col gap-5">
      <BriefingDocumentSummary
        label="Operational flight plan"
        issueLabel="Release"
        issue={ofpIssue(ofp.ofpContent)}
        pdfUrl={ofp.ofpDocumentUrl}
      />
      <Container>
        <BriefingDocumentText>
          <RawHtml html={unescapeOFP(ofp.ofpContent) || ""} />
        </BriefingDocumentText>
      </Container>
    </div>
  );
}
