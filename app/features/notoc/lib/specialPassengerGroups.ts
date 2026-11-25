import { SpecialServiceRequest } from "~/features/flight/model";
import { passengerRemarksOf } from "~/features/notoc/lib/notocFormat";
import type { NotocSpecialPassenger } from "~/features/notoc/model";

export type SpecialPassengerGroup = {
  ssr: SpecialServiceRequest;
  seats: string[];
  remarks: string[];
};

const ORDER: SpecialServiceRequest[] = [
  SpecialServiceRequest.WheelchairLithiumBattery,
  SpecialServiceRequest.WheelchairWetBattery,
  SpecialServiceRequest.WheelchairDryBattery,
  SpecialServiceRequest.Stretcher,
  SpecialServiceRequest.MedicalCase,
  SpecialServiceRequest.DeporteeEscorted,
  SpecialServiceRequest.DeporteeUnescorted,
  SpecialServiceRequest.Inadmissible,
  SpecialServiceRequest.UnaccompaniedMinor,
  SpecialServiceRequest.WheelchairToSeat,
  SpecialServiceRequest.WheelchairToSteps,
  SpecialServiceRequest.WheelchairToRamp,
  SpecialServiceRequest.Blind,
  SpecialServiceRequest.Deaf,
  SpecialServiceRequest.Infant,
  SpecialServiceRequest.PetInCabin,
  SpecialServiceRequest.MeetAndAssist,
];

export function groupSpecialPassengers(passengers: NotocSpecialPassenger[]): SpecialPassengerGroup[] {
  const groups = new Map<string, SpecialPassengerGroup>();

  for (const passenger of passengers) {
    const remarks = passengerRemarksOf(passenger);
    const key = `${passenger.ssr}|${remarks.join("|")}`;
    const group = groups.get(key) ?? { ssr: passenger.ssr, seats: [], remarks };
    group.seats.push(passenger.seat);
    groups.set(key, group);
  }

  return [...groups.values()].sort((one, other) => ORDER.indexOf(one.ssr) - ORDER.indexOf(other.ssr));
}
