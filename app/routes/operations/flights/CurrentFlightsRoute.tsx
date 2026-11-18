import React from "react";
import { FlightPhase } from "~/features/flight";
import { FlightListView } from "~/features/flight/components/Table/FlightListView";
import { FlightListProvider } from "~/features/flight/hooks/useFlightList";
import { usePageTitle } from "~/shared/hooks/usePageTitle";
import { PageHeader } from "~/shared/ui/Shell/PageHeader";

const PHASES = [FlightPhase.Emergency, FlightPhase.Ongoing];

export default function CurrentFlightsRoute() {
  usePageTitle("Current flights");

  return (
    <>
      <PageHeader title="Current flights" />
      <FlightListProvider limit={100}>
        <FlightListView phases={PHASES} emptyMessage="No flights are currently in the air." />
      </FlightListProvider>
    </>
  );
}
