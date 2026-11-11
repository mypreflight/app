import React from "react";
import { useFlightOfp } from "~/features/flight/hooks/useFlightOfp";
import { useHistoryFlight } from "~/features/flight/hooks/useHistoryFlight";
import { Container } from "~/shared/ui/Layout/Container";
import { RawHtml } from "~/shared/ui/RawHtml";

function unescapeRunwayAnalysis(html: string): string {
  return html.replaceAll(" ", "&nbsp;").replaceAll("\n", "<br />");
}

export function HistoryRunwayAnalysisTab() {
  const { flight } = useHistoryFlight();
  const { ofp, loading } = useFlightOfp(flight?.id ?? null);

  if (!flight) return null;

  return (
    <Container>
      {loading && <p className="text-sm text-gray-500 dark:text-gray-400">Loading runway analysis…</p>}
      {!loading && !ofp?.runwayAnalysis && (
        <p className="text-sm text-gray-500 dark:text-gray-400">No runway analysis was filed for this flight.</p>
      )}
      {ofp?.runwayAnalysis && (
        <RawHtml
          className="max-h-186 overflow-auto font-mono text-[13px] leading-tight text-gray-700 dark:text-gray-300"
          html={unescapeRunwayAnalysis(ofp.runwayAnalysis)}
        />
      )}
    </Container>
  );
}
