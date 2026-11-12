import type { LatLngTuple } from "leaflet";
import { type Flight, type FlightPathElement, LoadsheetKind, type Loadsheets } from "~/features/flight";
import type { HistoryFlightContextType } from "~/features/flight/hooks/useHistoryFlight";
import type { EtopsBriefing } from "~/features/route/model";

export function loadsheetsWithTrip(trip: number, block: number): Loadsheets {
  return {
    preliminary: null,
    final: {
      id: "final-loadsheet",
      kind: LoadsheetKind.Final,
      revision: 1,
      issuedById: null,
      issuedAt: new Date(),
      flightCrew: { pilots: 2, reliefPilots: 1, cabinCrew: 12 },
      passengers: 293,
      cargo: 7.3,
      payload: 36.3,
      zeroFuelWeight: 163.6,
      blockFuel: block,
      fuel: {
        block,
        taxi: 0.8,
        trip,
        alternate: 3.2,
        reserve: 2.7,
        contingencyType: "5%",
        contingencyAmount: 2.2,
        mel: 0,
        atc: 0,
        wxx: 0,
        extra: 0,
        tankering: 0,
      },
    },
  };
}

export function historyFlight(
  flight: Flight,
  flightPath: FlightPathElement[],
  loadsheets: Loadsheets = { preliminary: null, final: null },
): HistoryFlightContextType {
  return {
    flight,
    loadsheets,
    events: [],
    diversion: null,
    flightPath,
    pathLoadFailed: false,
    loading: false,
    loadFailed: false,
  };
}

export function briefingWaypoints(briefing: EtopsBriefing): LatLngTuple[] {
  return briefing.route.fixes.map((fix): LatLngTuple => [fix.latitude, fix.longitude]);
}
