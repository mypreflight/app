import type { HoldDeckName, LoadingPosition } from "~/features/cargo-hold/model";
import type {
  ColdChainReason,
  ColdChainRegime,
  ColdChainRisk,
  ColdChainSolution,
  HazardClass,
  NetQuantity,
  PackingGroup,
  ResponseCode,
  SpecialHandlingCode,
} from "~/features/cargo-manifest/model";
import type { SpecialServiceRequest } from "~/features/flight/model";

export enum NotocStage {
  Preliminary = "preliminary",
  Final = "final",
}

export type NotocDrill = {
  responseCode: ResponseCode;
  inherentRisk: string;
  riskToAircraftAndOccupants: string;
  spillAndFireProcedure: string;
  additionalRisks: string[];
};

export enum RadioactiveCategory {
  IWhite = "I-WHITE",
  IIYellow = "II-YELLOW",
  IIIYellow = "III-YELLOW",
}

export type NotocRadioactive = {
  category: RadioactiveCategory;
  transportIndex: number;
};

export enum ExplosiveDivision {
  Division12E = "1.2E",
  Division14G = "1.4G",
  Division14S = "1.4S",
}

export type NotocHeader = {
  operatorName: string;
  flightNumber: string;
  flightDate: string;
  stationOfLoading: string;
  stationOfLoadingCity: string;
  aircraftRegistration: string;
  aircraftType: string;
  preparedBy: string;
  loadingSupervisor: string;
  emergencyTelephone: string;
};

export type NotocDangerousGoods = {
  awb: string;
  unNumber: string;
  properShippingName: string;
  hazardClass: HazardClass;
  classOrDivision: ExplosiveDivision | HazardClass;
  subsidiaryRisk: HazardClass | null;
  packingGroup: PackingGroup | null;
  packages: number;
  netQuantity: NetQuantity;
  radioactive: NotocRadioactive | null;
  impCode: SpecialHandlingCode;
  uldId: string | null;
  cargoAircraftOnly: boolean;
  loadingPosition: LoadingPosition | null;
  compartment: number | null;
  unloadingAirport: string;
  drill: NotocDrill;
};

export type NotocDryIce = {
  compartment: number | null;
  packages: number;
  kg: number;
  unloadingAirport: string;
  drill: NotocDrill;
};

export enum HandlingRemark {
  CattleWithAttendant = "cattle_with_attendant",
  ChicksInVentilatedBoxes = "chicks_in_ventilated_boxes",
  CoffinApartFromFoodstuffs = "coffin_apart_from_foodstuffs",
  BeesInVentilatedPackages = "bees_in_ventilated_packages",
  FishInOxygenatedBags = "fish_in_oxygenated_bags",
  HatchingEggsFragile = "hatching_eggs_fragile",
  HorsesWithGroom = "horses_with_groom",
  PetsInKennels = "pets_in_kennels",
  SecuredStowage = "secured_stowage",
  TimeCriticalUnloadFirst = "time_critical_unload_first",
  ZooAnimalWithKeeper = "zoo_animal_with_keeper",
}

export enum HoldCondition {
  HeatedAndVentilated = "heated_and_ventilated",
  Heated = "heated",
  Ventilated = "ventilated",
}

export type NotocTemperatureRange = {
  minC: number;
  maxC: number;
};

export type NotocHeaviestPiece = {
  kg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
};

export type NotocSpecialLoad = {
  awb: string;
  description: string;
  pieces: number;
  shc: SpecialHandlingCode[];
  grossKg: number;
  handlingRemark: HandlingRemark | null;
  temperature: NotocTemperatureRange | null;
  holdCondition: HoldCondition | null;
  uldId: string | null;
  loadingPosition: LoadingPosition | null;
  compartment: number | null;
  unloadingAirport: string;
  heaviestPiece: NotocHeaviestPiece | null;
};

export type NotocColdChain = {
  awb: string;
  description: string;
  regime: ColdChainRegime;
  risk: ColdChainRisk;
  solution: ColdChainSolution;
  enduranceHours: number;
  exposureHours: number;
  marginHours: number;
  reason: ColdChainReason;
};

export type NotocCompartmentLoad = {
  compartment: number;
  deck: HoldDeckName;
  weightKg: number;
  dryIceKg: number;
};

export type NotocLoadSummary = {
  compartments: NotocCompartmentLoad[];
  containerCount: number;
  palletCount: number;
  looseLotCount: number;
  cargoKg: number;
  baggageKg: number;
  deadloadKg: number;
  beyondCount: number;
  tightestConnectionMinutes: number | null;
};

export type NotocMobilityAid = {
  compartment: number | null;
};

export type NotocSpecialPassenger = {
  seat: string;
  ssr: SpecialServiceRequest;
  mobilityAid: NotocMobilityAid | null;
};

export type NotocDocument = {
  header: NotocHeader;
  specialPassengers: NotocSpecialPassenger[];
  dangerousGoods: NotocDangerousGoods[];
  dryIce: NotocDryIce[];
  specialLoads: NotocSpecialLoad[];
  coldChain: NotocColdChain[];
  summary: NotocLoadSummary;
};

export type NotocReposition = {
  awb: string;
  fromPosition: LoadingPosition | null;
  toPosition: LoadingPosition | null;
};

export type NotocChanges = {
  changed: boolean;
  dangerousGoodsAdded: string[];
  dangerousGoodsRemoved: string[];
  specialLoadsAdded: string[];
  specialLoadsRemoved: string[];
  repositioned: NotocReposition[];
  cargoChangeKg: number;
  deadloadChangeKg: number;
};

export type FlightNotoc = {
  flightId: string;
  stage: NotocStage;
  issuedAt: string;
  acknowledgedById: string | null;
  acknowledgedAt: string | null;
  document: NotocDocument;
  changes: NotocChanges | null;
};
