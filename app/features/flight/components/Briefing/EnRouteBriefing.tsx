import React from "react";
import { FaRoute } from "react-icons/fa6";
import { BriefingColumn, BriefingColumns } from "~/features/flight/components/Briefing/BriefingColumns";
import { FixFuelReportsCard } from "~/features/flight/components/Briefing/FixFuelReportsCard";
import { useTrackedFlight } from "~/features/flight/hooks/useTrackedFlight";
import { enRouteFixes, hasOceanicTrack, oceanicFixes } from "~/features/flight/lib/briefingPhase";
import { EtopsPanel } from "~/features/route/components/Etops/EtopsPanel";
import { FiledRouteCard } from "~/features/route/components/FiledRouteCard";
import { OceanicCrossingPanel } from "~/features/route/components/OceanicCrossingPanel";
import { useRouteBriefingState } from "~/features/route/hooks/useRouteBriefing";
import { hasEtopsContent } from "~/features/route/lib/routeInsights";
import { PanelEmptyState } from "~/shared/ui/Display/PanelEmptyState";

type Props = {
  navLogHref: string;
};

export function EnRouteBriefing({ navLogHref }: Props) {
  const { flight } = useTrackedFlight();
  const { briefing, airports, loading, error, canReportFuel, takeoffTime, reportFixFuel } = useRouteBriefingState();

  if (flight === null) {
    return null;
  }

  if (loading) {
    return (
      <div className="h-48 animate-pulse rounded-2xl bg-gray-200/60 motion-reduce:animate-none dark:bg-gray-800" />
    );
  }

  if (error !== null || briefing === null) {
    return (
      <PanelEmptyState
        icon={FaRoute}
        title={error === null ? "No planned route" : "Route could not be loaded"}
        body={
          error === null
            ? "This flight carries no filed plan, so there is no oceanic track, ETOPS briefing or fix to report."
            : "The planned route did not come back from the API. Reload the page to try again."
        }
      />
    );
  }

  const crossing = briefing.oceanicCrossing;
  const etops = briefing.etops !== null && hasEtopsContent(briefing.etops) ? briefing.etops : null;
  const isOceanic = hasOceanicTrack(crossing);
  const reportable = isOceanic ? oceanicFixes(briefing.route.fixes, crossing) : enRouteFixes(briefing.route.fixes);
  const reports = reportable.length > 0 && (
    <FixFuelReportsCard
      title={isOceanic ? "Position and fuel reports" : "Fix fuel reports"}
      fixes={reportable}
      takeoffTime={takeoffTime}
      canReport={canReportFuel}
      onReport={reportFixFuel}
    />
  );

  return (
    <div className="flex flex-col gap-3">
      {canReportFuel && reports}
      <FiledRouteCard flight={flight} briefingHref={navLogHref} />
      {(hasOceanicTrack(crossing) || etops !== null) && (
        <BriefingColumns>
          {hasOceanicTrack(crossing) && (
            <BriefingColumn>
              <OceanicCrossingPanel crossing={crossing} />
            </BriefingColumn>
          )}
          {etops !== null && (
            <BriefingColumn>
              <EtopsPanel plan={etops} airports={airports} airportHref={(id) => `/airports-library/${id}`} />
            </BriefingColumn>
          )}
        </BriefingColumns>
      )}
      {!canReportFuel && reports}
    </div>
  );
}
