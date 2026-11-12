import type { Route } from ".react-router/types/app/routes/pilot/history/+types/FlightHistoryRoute";
import React from "react";
import { FlightHistoryDashboard } from "~/features/flight/components/Dashboard/History/FlightHistoryDashboard";
import { useFlightHistoryEntry } from "~/features/flight/hooks/useFlightHistoryStage";
import { HistoryFlightProvider } from "~/features/flight/hooks/useHistoryFlight";

export default function FlightHistoryRoute({ params }: Route.ComponentProps) {
  const entry = useFlightHistoryEntry();

  return (
    <HistoryFlightProvider
      key={params.id}
      flightId={params.id}
      initialFlight={entry?.cachedFlight(params.id)}
      initialPath={entry?.cachedPath(params.id)}
    >
      <FlightHistoryDashboard flightId={params.id} viewSlug={params.view} tabSlug={params.tab} />
    </HistoryFlightProvider>
  );
}
