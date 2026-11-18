import React from "react";
import { LuPlaneTakeoff } from "react-icons/lu";
import { useAirportLayout } from "~/features/airport/hooks/useAirportLayout";
import type { Flight } from "~/features/flight";
import { GroundStopBox } from "~/features/flight/components/Dashboard/Main/Box/GroundStopBox";
import type { GroundStop } from "~/features/flight/hooks/useGroundStop";
import { CardHeader } from "~/shared/ui/Layout/CardHeader";
import { Container } from "~/shared/ui/Layout/Container";
import { EmptyState } from "~/shared/ui/Layout/EmptyState";

type Props = {
  groundStop: GroundStop | null;
  nextFlight: Flight | null;
  nextFlightFailed: boolean;
};

export function NoCurrentFlightBox({ groundStop, nextFlight, nextFlightFailed }: Props) {
  const layout = useAirportLayout(
    groundStop?.airport.id ?? null,
    groundStop?.arrivedOn?.arrivalParkingPositionId ?? null,
  );

  if (!groundStop) {
    return (
      <Container padding="condensed" className="hidden sm:flex" header={<CardHeader title="Current flight" />}>
        <EmptyState
          icon={LuPlaneTakeoff}
          title="No flight in progress"
          description="Each flight shows here from check-in until it closes."
          className="py-8"
        />
      </Container>
    );
  }

  return (
    <GroundStopBox
      groundStop={groundStop}
      layout={layout}
      nextFlight={nextFlight}
      nextFlightFailed={nextFlightFailed}
    />
  );
}
