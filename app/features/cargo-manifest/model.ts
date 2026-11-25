import type { HoldDeckName, LoadingPosition, UldType } from "~/features/cargo-hold/model";

export enum CargoUnitKind {
  Uld = "uld",
  BulkLot = "bulk_lot",
}

export enum ContentClass {
  Cargo = "cargo",
  Baggage = "baggage",
  Mail = "mail",
}

export enum TransferRole {
  Local = "local",
  OutboundTransfer = "outbound_transfer",
  InboundTransfer = "inbound_transfer",
  ThroughTransfer = "through_transfer",
}

export enum ShipmentStatus {
  Loaded = "loaded",
  Offloaded = "offloaded",
}

export enum OffloadReason {
  PayloadRestriction = "payload_restriction",
  SpaceRestriction = "space_restriction",
}

export enum ColdChainRegime {
  Crt = "CRT",
  Col = "COL",
  Fro = "FRO",
}

export enum ColdChainRisk {
  Low = "low",
  Elevated = "elevated",
  High = "high",
}

export enum ColdChainSolution {
  Active = "active",
  Passive = "passive",
  DryIce = "dry_ice",
}

export enum BaggageSource {
  Reconciled = "reconciled",
  Derived = "derived",
}

export enum SpecialHandlingCode {
  ActiveTemperatureControl = "ACT",
  Perishable = "PER",
  PerishableMeat = "PEM",
  PerishableSeafood = "PES",
  PerishableFlowers = "PEF",
  PerishableProduce = "PEP",
  Foodstuffs = "EAT",
  Cool = "COL",
  ControlledRoomTemperature = "CRT",
  Frozen = "FRO",
  LiveAnimals = "AVI",
  LiveAnimalsHold = "AVIH",
  HatchingEggs = "HEG",
  HumanRemains = "HUM",
  LivingOrgans = "LHO",
  Valuable = "VAL",
  Vulnerable = "VUN",
  Pharmaceuticals = "PIL",
  UndevelopedFilm = "FIL",
  Heavy = "HEA",
  Outsized = "BIG",
  Wet = "WET",
  Obnoxious = "OBX",
  CargoAircraftOnly = "CAO",
  MunitionsOfWar = "MUW",
  SportingWeapons = "SWP",
  DryIce = "ICE",
  Magnetised = "MAG",
  DiplomaticMail = "DIP",
  Mail = "MAL",
  CompanyMail = "COM",
  Express = "XPS",
  Newspapers = "NWP",
  DangerousGoods = "DGR",
  FlammableLiquid = "RFL",
  FlammableGas = "RFG",
  ToxicGas = "RPG",
  NonFlammableGas = "RNG",
  FlammableSolid = "RFS",
  SpontaneouslyCombustible = "RSC",
  DangerousWhenWet = "RFW",
  Oxidiser = "ROX",
  OrganicPeroxide = "ROP",
  Toxic = "RPB",
  InfectiousSubstance = "RIS",
  RadioactiveWhite = "RRW",
  RadioactiveYellow = "RRY",
  Corrosive = "RCM",
  MiscellaneousDangerousGoods = "RMD",
  LithiumIon = "RLI",
  LithiumMetal = "RLM",
  LithiumIonInEquipment = "ELI",
  LithiumMetalInEquipment = "ELM",
  ExplosivesOther = "REX",
  ExplosivesDivision14S = "RXS",
  ExplosivesDivision14G = "RXG",
}

export enum Commodity {
  FlowersRoses = "flowers-roses",
  FlowersTulips = "flowers-tulips",
  SalmonFresh = "salmon-fresh",
  CodFresh = "cod-fresh",
  LiveLobster = "live-lobster",
  SnowCrab = "snow-crab",
  TunaFresh = "tuna-fresh",
  BeefChilled = "beef-chilled",
  LambChilled = "lamb-chilled",
  Cherries = "cherries",
  Berries = "berries",
  Asparagus = "asparagus",
  Mango = "mango",
  Cheese = "cheese",
  Vaccines = "vaccines",
  Insulin = "insulin",
  ClinicalTrialKits = "clinical-trial-kits",
  BloodPlasma = "blood-plasma",
  DiagnosticReagents = "diagnostic-reagents",
  MedicalDevices = "medical-devices",
  LivingOrgans = "living-organs",
  BiologicalCatB = "biological-cat-b",
  InfectiousCatA = "infectious-cat-a",
  Radiopharmaceuticals = "radiopharmaceuticals",
  Horses = "horses",
  DayOldChicks = "day-old-chicks",
  HatchingEggs = "hatching-eggs",
  TropicalFish = "tropical-fish",
  BreedingCattle = "breeding-cattle",
  PetsInHold = "pets-in-hold",
  ZooTransfer = "zoo-transfer",
  HoneyBees = "honey-bees",
  SemiconductorWafers = "semiconductor-wafers",
  Smartphones = "smartphones",
  Servers = "servers",
  GpuAccelerators = "gpu-accelerators",
  DisplayPanels = "display-panels",
  NetworkEquipment = "network-equipment",
  MedicalImaging = "medical-imaging",
  CameraEquipment = "camera-equipment",
  LithiumIonStandalone = "lithium-ion-standalone",
  LithiumIonInEquipment = "lithium-ion-in-equipment",
  LithiumMetalStandalone = "lithium-metal-standalone",
  DryIce = "dry-ice",
  MagnetisedMaterial = "magnetised-material",
  EnvironmentallyHazardous = "environmentally-hazardous",
  Paint = "paint",
  Aerosols = "aerosols",
  CompressedOxygen = "compressed-oxygen",
  ArgonCompressed = "argon-compressed",
  FireExtinguishers = "fire-extinguishers",
  Isopropanol = "isopropanol",
  Perfumery = "perfumery",
  SafetyMatches = "safety-matches",
  CalciumCarbide = "calcium-carbide",
  HydrogenPeroxide = "hydrogen-peroxide",
  SodiumHypochlorite = "sodium-hypochlorite",
  BatteryAcid = "battery-acid",
  AmmunitionSporting = "ammunition-sporting",
  Pesticide = "pesticide",
  AutoParts = "auto-parts",
  VehicleEngines = "vehicle-engines",
  AirbagInflators = "airbag-inflators",
  Tyres = "tyres",
  MachineTools = "machine-tools",
  HydraulicComponents = "hydraulic-components",
  IndustrialPumps = "industrial-pumps",
  InjectionMoulds = "injection-moulds",
  EngineFanBlades = "engine-fan-blades",
  LandingGear = "landing-gear",
  Avionics = "avionics",
  AircraftTyres = "aircraft-tyres",
  OxygenGenerators = "oxygen-generators",
  FastFashion = "fast-fashion",
  Footwear = "footwear",
  ECommerceParcels = "e-commerce-parcels",
  Cosmetics = "cosmetics",
  Toys = "toys",
  Furniture = "furniture",
  SportingGoods = "sporting-goods",
  PrintedMatter = "printed-matter",
  BankNotes = "bank-notes",
  GoldBullion = "gold-bullion",
  Jewellery = "jewellery",
  Artwork = "artwork",
  DiplomaticMail = "diplomatic-mail",
  UndevelopedFilm = "undeveloped-film",
  HumanRemains = "human-remains",
  SportingWeapons = "sporting-weapons",
  MunitionsOfWar = "munitions-of-war",
  PostalMail = "postal-mail",
  CompanyMail = "company-mail",
  ExpressDocuments = "express-documents",
  Newspapers = "newspapers",
  CoffeeBeans = "coffee-beans",
  Chocolate = "chocolate",
  Spirits = "spirits",
  RacingCar = "racing-car",
  ConcertRig = "concert-rig",
  SatelliteComponents = "satellite-components",
}

export enum HazardClass {
  Explosives = "1",
  FlammableGas = "2.1",
  NonFlammableGas = "2.2",
  ToxicGas = "2.3",
  FlammableLiquid = "3",
  FlammableSolid = "4.1",
  SpontaneouslyCombustible = "4.2",
  DangerousWhenWet = "4.3",
  Oxidiser = "5.1",
  OrganicPeroxide = "5.2",
  ToxicSubstance = "6.1",
  InfectiousSubstance = "6.2",
  Radioactive = "7",
  Corrosive = "8",
  Miscellaneous = "9",
}

export enum PackingGroup {
  I = "I",
  II = "II",
  III = "III",
}

export enum QuantityUnit {
  Kilograms = "kg",
  Litres = "L",
  Millilitres = "mL",
  Terabecquerels = "TBq",
  Units = "unit",
}

export type NetQuantity = {
  amount: number;
  unit: QuantityUnit;
};

export enum ColdChainReasonKind {
  EnduranceExceeded = "endurance_exceeded",
  HotTransfer = "hot_transfer",
  LongConnection = "long_connection",
  ThinMargin = "thin_margin",
  WithinMargin = "within_margin",
}

export type ColdChainReason =
  | { kind: ColdChainReasonKind.EnduranceExceeded }
  | { kind: ColdChainReasonKind.HotTransfer; ambientC: number }
  | { kind: ColdChainReasonKind.LongConnection; connectionHours: number }
  | { kind: ColdChainReasonKind.ThinMargin }
  | { kind: ColdChainReasonKind.WithinMargin };

export enum DrillLetter {
  Anaesthetic = "A",
  Corrosive = "C",
  Explosive = "E",
  Flammable = "F",
  HighlyIgnitable = "H",
  Irritant = "I",
  OtherRiskLowOrNone = "L",
  Magnetic = "M",
  Noxious = "N",
  Toxic = "P",
  SpontaneouslyCombustible = "S",
  WetGivesOffGas = "W",
  Oxidizer = "X",
  Infectious = "Y",
}

export type DrillNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export type ResponseCode = {
  drillNumber: DrillNumber;
  drillLetters: DrillLetter[];
};

export type DangerousGoods = {
  unNumber: string;
  properShippingName: string;
  hazardClass: HazardClass;
  subsidiaryRisk: HazardClass | null;
  packingGroup: PackingGroup | null;
  netQuantity: NetQuantity;
  cargoAircraftOnly: boolean;
  responseCode: ResponseCode;
  sourceNote?: string;
};

export type ColdChain = {
  regime: ColdChainRegime;
  minC: number;
  maxC: number;
  solution: ColdChainSolution;
  setPointC: number | null;
  enduranceHours: number;
  exposureHours: number;
  marginHours: number;
  risk: ColdChainRisk;
  reason: ColdChainReason;
};

export type CargoShipmentEntry = {
  awb: string;
  commodity: Commodity;
  description: string;
  pieces: number;
  grossKg: number;
  volumeM3: number;
  shc: SpecialHandlingCode[];
  shipper: string;
  consignee: string;
  origin: string;
  destination: string;
  transferRole: TransferRole;
  onwardCarrier: string | null;
  onwardFlightNumber: string | null;
  connectionMinutes: number | null;
  connectionAtRisk: boolean;
  dangerousGoods: DangerousGoods | null;
  coldChain: ColdChain | null;
  status: ShipmentStatus;
  offloadReason: OffloadReason | null;
  offloadedFromPosition: LoadingPosition | null;
};

export type CargoUnitEntry = {
  kind: CargoUnitKind;
  uldCode: string | null;
  uldType: UldType | null;
  loadingPosition: LoadingPosition | null;
  compartment: number | null;
  deck: HoldDeckName | null;
  tareKg: number;
  grossKg: number;
  volumeM3: number;
  contentClass: ContentClass;
  beyondDestination: string | null;
  sealed: boolean;
  bagCount: number | null;
  priority: boolean;
  shipments: CargoShipmentEntry[];
};

export type CompartmentLoad = {
  compartment: number;
  deck: HoldDeckName;
  weightKg: number;
  dryIceKg: number;
};

export type SegregationAdvisory = {
  compartment: number;
  deck: HoldDeckName;
  one: SpecialHandlingCode;
  other: SpecialHandlingCode;
};

export type FlightCargoManifest = {
  flightId: string;
  holdVariant: string | null;
  cargoKg: number;
  containerCount: number;
  bulkLotCount: number;
  shipmentCount: number;
  dangerousGoodsCount: number;
  worstColdChainRisk: ColdChainRisk | null;
  cargoAircraftOnlyCount: number;
  transferCount: number;
  tightestConnectionMinutes: number | null;
  baggageKg: number;
  bagCount: number;
  baggageSource: BaggageSource | null;
  compartmentLoad: CompartmentLoad[];
  segregationAdvisories: SegregationAdvisory[];
  units: CargoUnitEntry[];
};

export function isTransfer(shipment: CargoShipmentEntry): boolean {
  return shipment.transferRole !== TransferRole.Local;
}

export function continuesBeyond(shipment: CargoShipmentEntry): boolean {
  return shipment.onwardFlightNumber !== null;
}

export function unitTotalKg(unit: CargoUnitEntry): number {
  return unit.grossKg + unit.tareKg;
}
