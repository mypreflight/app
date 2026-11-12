import type { Flight } from "~/features/flight";

export type FlightListLinks = {
  flight: (flight: Flight) => string;
  airport: (airportId: string) => string;
  aircraft: (flight: Flight) => string;
  operator: (flight: Flight) => string | null;
};

export const operationsLinks: FlightListLinks = {
  flight: (flight) => `/flights/${flight.id}/overview`,
  airport: (airportId) => `/airports/${airportId}`,
  aircraft: (flight) => `/operators/${flight.operator.id}/aircraft/${flight.aircraft.id}`,
  operator: (flight) => `/operators/${flight.operator.id}/fleet`,
};
