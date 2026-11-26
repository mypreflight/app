import { ColdChainSolution } from "~/features/cargo-manifest/model";
import { SpecialServiceRequest } from "~/features/flight/model";
import { HandlingRemark, HoldCondition, NotocStage } from "~/features/notoc/model";

const stageLabels: Record<NotocStage, string> = {
  [NotocStage.Preliminary]: "Preliminary",
  [NotocStage.Final]: "Final",
};

const handlingRemarkLines: Record<HandlingRemark, string> = {
  [HandlingRemark.CattleWithAttendant]: "CATTLE IN AIR STALLS, ATTENDANT ON BOARD",
  [HandlingRemark.ChicksInVentilatedBoxes]: "DAY-OLD CHICKS IN VENTILATED BOXES",
  [HandlingRemark.CoffinApartFromFoodstuffs]: "COFFIN, STOW APART FROM FOODSTUFFS",
  [HandlingRemark.BeesInVentilatedPackages]: "LIVE BEES IN VENTILATED PACKAGES",
  [HandlingRemark.FishInOxygenatedBags]: "LIVE FISH IN OXYGENATED BAGS",
  [HandlingRemark.HatchingEggsFragile]: "HATCHING EGGS, FRAGILE",
  [HandlingRemark.HorsesWithGroom]: "HORSES IN AIR STALLS, GROOM ON BOARD",
  [HandlingRemark.PetsInKennels]: "PETS IN IATA KENNELS",
  [HandlingRemark.SecuredStowage]: "SECURED STOWAGE",
  [HandlingRemark.TimeCriticalUnloadFirst]: "TIME-CRITICAL, UNLOAD FIRST",
  [HandlingRemark.ZooAnimalWithKeeper]: "ZOO ANIMAL IN TRANSPORT CRATE, KEEPER ON BOARD",
};

const holdConditionLines: Record<HoldCondition, string> = {
  [HoldCondition.HeatedAndVentilated]: "HEATED AND VENTILATED HOLD",
  [HoldCondition.Heated]: "HEATED HOLD",
  [HoldCondition.Ventilated]: "VENTILATED HOLD",
};

const temperatureSolutionLines: Record<ColdChainSolution, string[]> = {
  [ColdChainSolution.Active]: ["ACTIVE CONTAINER"],
  [ColdChainSolution.DryIce]: ["PACKED IN DRY ICE"],
  [ColdChainSolution.Passive]: [],
};

const passengerRemarkLines: Record<SpecialServiceRequest, string[]> = {
  [SpecialServiceRequest.Infant]: ["ON LAP"],
  [SpecialServiceRequest.WheelchairToRamp]: [],
  [SpecialServiceRequest.WheelchairToSteps]: [],
  [SpecialServiceRequest.WheelchairToSeat]: [],
  [SpecialServiceRequest.WheelchairDryBattery]: ["NON-SPILLABLE BATTERY INSTALLED"],
  [SpecialServiceRequest.WheelchairWetBattery]: ["SPILLABLE BATTERY INSTALLED, AID STOWED UPRIGHT"],
  [SpecialServiceRequest.WheelchairLithiumBattery]: [],
  [SpecialServiceRequest.Stretcher]: ["STRETCHER, MEDICAL ESCORT ON BOARD"],
  [SpecialServiceRequest.MedicalCase]: ["MEDICAL CLEARANCE GIVEN"],
  [SpecialServiceRequest.UnaccompaniedMinor]: ["IN THE CARE OF CABIN CREW"],
  [SpecialServiceRequest.Blind]: [],
  [SpecialServiceRequest.Deaf]: [],
  [SpecialServiceRequest.MeetAndAssist]: [],
  [SpecialServiceRequest.PetInCabin]: ["IN CONTAINER UNDER SEAT"],
  [SpecialServiceRequest.DeporteeEscorted]: ["ESCORTS SEATED ALONGSIDE"],
  [SpecialServiceRequest.DeporteeUnescorted]: [],
  [SpecialServiceRequest.Inadmissible]: ["TRAVEL DOCUMENTS HELD BY CREW"],
};

export function translateNotocStage(stage: NotocStage): string {
  return stageLabels[stage];
}

export function translateHandlingRemark(remark: HandlingRemark): string {
  return handlingRemarkLines[remark];
}

export function translateHoldCondition(condition: HoldCondition): string {
  return holdConditionLines[condition];
}

export function translateTemperatureSolution(solution: ColdChainSolution): string[] {
  return temperatureSolutionLines[solution];
}

export function translatePassengerRemarks(request: SpecialServiceRequest): string[] {
  return passengerRemarkLines[request];
}
