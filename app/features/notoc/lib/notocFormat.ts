import { designatorOf } from "~/features/cargo-hold/lib/designator";
import type { LoadingPosition } from "~/features/cargo-hold/model";
import { netQuantityOf } from "~/features/cargo-manifest/lib/cargoWording";
import { HazardClass, SpecialHandlingCode } from "~/features/cargo-manifest/model";
import { SpecialServiceRequest } from "~/features/flight/model";
import {
  type NotocColdChain,
  type NotocDangerousGoods,
  type NotocDryIce,
  type NotocHeaviestPiece,
  type NotocRadioactive,
  type NotocSpecialLoad,
  type NotocSpecialPassenger,
  type NotocTemperatureRange,
  RadioactiveCategory,
} from "~/features/notoc/model";
import { toHuman } from "~/i18n/translate";

type Placement = {
  loadingPosition: LoadingPosition | null;
  compartment: number | null;
};

export const DRY_ICE = {
  properShippingName: "Dry ice",
  unNumber: "UN1845",
  classOrDivision: HazardClass.Miscellaneous,
  impCode: SpecialHandlingCode.DryIce,
};

export function placementOf(entry: Placement, hasCuratedHold: boolean): string {
  if (entry.loadingPosition !== null) {
    return designatorOf(entry.loadingPosition);
  }

  if (entry.compartment !== null) {
    return `CPT ${entry.compartment}`;
  }

  return hasCuratedHold ? "Loose" : "No hold data";
}

export function unNumberOf(entry: Pick<NotocDangerousGoods, "unNumber">): string {
  return entry.unNumber.startsWith("UN") ? entry.unNumber : `UN${entry.unNumber}`;
}

export function kilograms(kg: number): string {
  return `${kg.toLocaleString("en-US")} kg`;
}

export function transportIndexOf({ category, transportIndex }: NotocRadioactive): string {
  return category === RadioactiveCategory.IWhite ? "" : String(transportIndex);
}

export function quantityOf(entry: NotocDangerousGoods): string {
  if (entry.radioactive !== null) {
    const index = transportIndexOf(entry.radioactive);

    return `${entry.packages} pkg · ${entry.radioactive.category}${index === "" ? "" : ` · TI ${index}`}`;
  }

  return `${entry.packages} × ${netQuantityOf(entry.netQuantity)}`;
}

export function dryIceQuantityOf(entry: NotocDryIce): string {
  return `${entry.packages} pkg · ${kilograms(entry.kg)} total`;
}

function signed(celsius: number): string {
  return celsius > 0 ? `+${celsius}` : `${celsius}`;
}

function temperatureLine({ minC, maxC }: NotocTemperatureRange): string {
  return `KEEP AT ${signed(minC)} TO ${signed(maxC)} °C`;
}

function heaviestPieceLine({ kg, lengthCm, widthCm, heightCm }: NotocHeaviestPiece): string {
  return `HEAVIEST PIECE ${kg} KG, ${lengthCm}x${widthCm}x${heightCm} CM`;
}

export function supplementaryLinesOf(load: NotocSpecialLoad, coldChain: NotocColdChain[]): string[] {
  const { handlingRemark, temperature, holdCondition, heaviestPiece } = load;
  const solution = coldChain.find((entry) => entry.awb === load.awb)?.solution;

  return [
    ...(handlingRemark === null ? [] : [toHuman.notoc.handlingRemark(handlingRemark)]),
    ...(temperature === null ? [] : [temperatureLine(temperature)]),
    ...(solution === undefined ? [] : toHuman.notoc.temperatureSolution(solution)),
    ...(holdCondition === null ? [] : [toHuman.notoc.holdCondition(holdCondition)]),
    ...(heaviestPiece === null ? [] : [heaviestPieceLine(heaviestPiece)]),
  ];
}

export function passengerRemarksOf({ seat, ssr, mobilityAid }: NotocSpecialPassenger): string[] {
  const battery =
    ssr === SpecialServiceRequest.WheelchairLithiumBattery ? [`LITHIUM BATTERY REMOVED, IN CABIN AT ${seat}`] : [];
  const aid =
    mobilityAid === null
      ? []
      : [`MOBILITY AID IN HOLD${mobilityAid.compartment === null ? "" : `, CPT ${mobilityAid.compartment}`}`];

  return [...toHuman.notoc.passengerRemarks(ssr), ...battery, ...aid];
}

export function formDate(isoDate: string): string {
  const [year, month, day] = isoDate.slice(0, 10).split("-");

  return `${day}/${month}/${year.slice(2)}`;
}
