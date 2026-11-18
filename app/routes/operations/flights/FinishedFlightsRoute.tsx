import React from "react";
import { FlightPhase } from "~/features/flight";
import { blockTimeColumn } from "~/features/flight/components/List/FlightListColumns";
import { FlightListView } from "~/features/flight/components/Table/FlightListView";
import { FlightListProvider } from "~/features/flight/hooks/useFlightList";
import { usePageTitle } from "~/shared/hooks/usePageTitle";
import { PageHeader } from "~/shared/ui/Shell/PageHeader";

const PHASES = [FlightPhase.Finished];

export default function FinishedFlightsRoute() {
  usePageTitle("Flight history");

  return (
    <>
      <PageHeader title="Flight history" />
      <FlightListProvider>
        <FlightListView phases={PHASES} emptyMessage="No finished flights found." trailingColumn={blockTimeColumn} />
      </FlightListProvider>
    </>
  );
}
