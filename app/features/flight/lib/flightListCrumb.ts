import { FlightStatus } from "~/features/flight/model";
import type { Crumb } from "~/shared/ui/Section/Breadcrumbs";

const UPCOMING = new Set<FlightStatus>([FlightStatus.Created, FlightStatus.Ready]);

export function flightListCrumb(status: FlightStatus): Crumb {
  if (UPCOMING.has(status)) {
    return { label: "Flight plans", to: "/flights" };
  }

  if (status === FlightStatus.Closed) {
    return { label: "Flight history", to: "/finished-flights" };
  }

  return { label: "Current flights", to: "/current-flights" };
}
