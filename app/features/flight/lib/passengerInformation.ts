import { CABIN_ORDER } from "~/features/cabin-layout/lib/seatAppearance";
import { type CabinClass, Deck } from "~/features/cabin-layout/model";
import { type ManifestPassenger, SpecialServiceRequest } from "~/features/flight/model";

export type RequestedService = ManifestPassenger & { ssr: SpecialServiceRequest };

export type RequestCount = { request: SpecialServiceRequest; count: number };

export type CabinCount = { cabin: CabinClass; count: number };

const REQUEST_ORDER = Object.values(SpecialServiceRequest);
const SEAT = /^(\d+)([A-Z]*)$/;

export function findSpecialServiceRequest(value: string | null | undefined): SpecialServiceRequest | null {
  return REQUEST_ORDER.find((request) => request === value) ?? null;
}

function seatKey(passenger: ManifestPassenger): [number, number, string] {
  const match = SEAT.exec(passenger.designator);
  const row = match === null ? Number.MAX_SAFE_INTEGER : Number(match[1]);

  return [passenger.deck === Deck.Upper ? 1 : 0, row, match?.[2] ?? passenger.designator];
}

export function compareSeats(left: ManifestPassenger, right: ManifestPassenger): number {
  const [leftDeck, leftRow, leftLetter] = seatKey(left);
  const [rightDeck, rightRow, rightLetter] = seatKey(right);

  return leftDeck - rightDeck || leftRow - rightRow || leftLetter.localeCompare(rightLetter);
}

export function requestedServices(passengers: ManifestPassenger[]): RequestedService[] {
  return passengers.filter((passenger): passenger is RequestedService => passenger.ssr !== null).sort(compareSeats);
}

export function requestCounts(services: RequestedService[]): RequestCount[] {
  return REQUEST_ORDER.map((request) => ({
    request,
    count: services.filter((service) => service.ssr === request).length,
  })).filter(({ count }) => count > 0);
}

export function cabinCounts(passengers: ManifestPassenger[]): CabinCount[] {
  return CABIN_ORDER.map((cabin) => ({
    cabin,
    count: passengers.filter((passenger) => passenger.cabin === cabin).length,
  })).filter(({ count }) => count > 0);
}
