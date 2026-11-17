import React from "react";
import { FlightPhase } from "~/features/flight";
import { PlanFlightOptions } from "~/features/flight/components/PlanFlightOptions";
import { FlightListView } from "~/features/flight/components/Table/FlightListView";
import { FlightListProvider } from "~/features/flight/hooks/useFlightList";
import { usePageTitle } from "~/shared/hooks/usePageTitle";
import { PageHeader } from "~/shared/ui/Shell/PageHeader";

const PHASES = [FlightPhase.Upcoming];

export default function FlightsListRoute() {
  usePageTitle("Flight plans");

  return (
    <>
      <PageHeader title="Flight plans" />
      <FlightListProvider>
        <PlanFlightOptions />
        <FlightListView phases={PHASES} emptyMessage="No upcoming flights found." />
      </FlightListProvider>
    </>
  );
}
