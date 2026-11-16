import type { Decorator } from "@storybook/react-vite";
import React from "react";
import { FlightStatus } from "~/features/flight";
import { TrackedFlightContext } from "~/features/flight/hooks/useTrackedFlight";
import { RouteBriefingContext } from "~/features/route/hooks/useRouteBriefing";
import { natFlight, natRouteState, natTrackedFlight } from "../fixtures/briefing";

export type NatArgs = {
  status: FlightStatus;
  reports: number;
};

export const NAT_STATUSES = [
  FlightStatus.CheckedIn,
  FlightStatus.BoardingStarted,
  FlightStatus.TaxiingOut,
  FlightStatus.InCruise,
  FlightStatus.TaxiingIn,
];

export const onNatFlight: Decorator = (Story, { args }) => {
  const { status = FlightStatus.InCruise, reports = 0 } = args as Partial<NatArgs>;
  const flight = natFlight(status);

  return (
    <TrackedFlightContext.Provider value={natTrackedFlight(flight)}>
      <RouteBriefingContext.Provider value={natRouteState(flight, reports)}>
        <Story />
      </RouteBriefingContext.Provider>
    </TrackedFlightContext.Provider>
  );
};
