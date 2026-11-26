import React from "react";
import { BriefingDocumentSummary } from "~/features/flight/components/Briefing/BriefingDocumentSummary";
import { BriefingDocumentText } from "~/features/flight/components/Briefing/BriefingDocumentText";
import { useFlightOfp } from "~/features/flight/hooks/useFlightOfp";
import { useTrackedFlight } from "~/features/flight/hooks/useTrackedFlight";
import { runwayAnalysisIssue } from "~/features/flight/lib/simbriefIssue";
import { Container } from "~/shared/ui/Layout/Container";
import { RawHtml } from "~/shared/ui/RawHtml";

function unescapeRunwayAnalysis(html: string): string {
  return html.replaceAll(" ", "&nbsp;").replaceAll("\n", "<br />");
}

export function FlightRunwayAnalysisTab() {
  const { flight } = useTrackedFlight();
  const { ofp } = useFlightOfp(flight?.id ?? null);

  if (!flight || !ofp) {
    return null;
  }

  return (
    <div className="flex flex-col gap-5">
      <BriefingDocumentSummary
        label="Takeoff and landing report"
        issueLabel="Report"
        issue={runwayAnalysisIssue(ofp.runwayAnalysis)}
        pdfUrl={ofp.ofpDocumentUrl}
      />
      <Container>
        <BriefingDocumentText>
          <b>[ Runway analysis ]</b>
          <br />
          <b>--------------------------------------------------------------------</b>
          <RawHtml html={unescapeRunwayAnalysis(ofp.runwayAnalysis) || ""} />
        </BriefingDocumentText>
      </Container>
    </div>
  );
}
