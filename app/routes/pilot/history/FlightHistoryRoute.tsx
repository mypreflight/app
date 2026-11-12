import type { Route } from ".react-router/types/app/routes/pilot/history/+types/FlightHistoryRoute";
import React from "react";
import { FlightHistoryDashboard } from "~/features/flight/components/Dashboard/History/FlightHistoryDashboard";
import { HistoryFlightProvider } from "~/features/flight/hooks/useHistoryFlight";
import { usePageTitle } from "~/shared/hooks/usePageTitle";

export default function FlightHistoryRoute({ params }: Route.ComponentProps) {
  usePageTitle("Flight history");

  return (
    <HistoryFlightProvider flightId={params.id}>
      <FlightHistoryDashboard flightId={params.id} viewSlug={params.view} tabSlug={params.tab} />
    </HistoryFlightProvider>
  );
}
