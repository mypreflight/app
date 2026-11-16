import { FlightStatus } from "~/features/flight/model";

const EMERGENCY_WINDOW: ReadonlySet<FlightStatus> = new Set([
  FlightStatus.TaxiingOut,
  FlightStatus.InCruise,
  FlightStatus.TaxiingIn,
]);

const DIVERSION_WINDOW: ReadonlySet<FlightStatus> = new Set([FlightStatus.TaxiingOut, FlightStatus.InCruise]);

export function isInEmergencyWindow(status: FlightStatus): boolean {
  return EMERGENCY_WINDOW.has(status);
}

export function isInDiversionWindow(status: FlightStatus): boolean {
  return DIVERSION_WINDOW.has(status);
}
