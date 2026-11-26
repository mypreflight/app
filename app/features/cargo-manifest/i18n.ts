import {
  BaggageSource,
  CargoUnitKind,
  ColdChainRegime,
  ColdChainRisk,
  ColdChainSolution,
  Commodity,
  ContentClass,
  HazardClass,
  OffloadReason,
  ShipmentStatus,
  SpecialHandlingCode,
  TransferRole,
} from "~/features/cargo-manifest/model";

const cargoUnitKindLabels: Record<CargoUnitKind, string> = {
  [CargoUnitKind.Uld]: "Unit load device",
  [CargoUnitKind.BulkLot]: "Loose lot",
};

const contentClassLabels: Record<ContentClass, string> = {
  [ContentClass.Cargo]: "Cargo",
  [ContentClass.Baggage]: "Baggage",
  [ContentClass.Mail]: "Mail",
};

const transferRoleLabels: Record<TransferRole, string> = {
  [TransferRole.Local]: "Local",
  [TransferRole.OutboundTransfer]: "Outbound transfer",
  [TransferRole.InboundTransfer]: "Inbound transfer",
  [TransferRole.ThroughTransfer]: "Through transfer",
};

const shipmentStatusLabels: Record<ShipmentStatus, string> = {
  [ShipmentStatus.Loaded]: "Loaded",
  [ShipmentStatus.Offloaded]: "Offloaded",
};

const offloadReasonLabels: Record<OffloadReason, string> = {
  [OffloadReason.PayloadRestriction]: "Payload restriction",
  [OffloadReason.SpaceRestriction]: "Space restriction",
};

const coldChainRegimeLabels: Record<ColdChainRegime, string> = {
  [ColdChainRegime.Crt]: "Controlled room temperature",
  [ColdChainRegime.Col]: "Cool chain",
  [ColdChainRegime.Fro]: "Frozen",
};

const coldChainRiskLabels: Record<ColdChainRisk, string> = {
  [ColdChainRisk.Low]: "Low",
  [ColdChainRisk.Elevated]: "Elevated",
  [ColdChainRisk.High]: "High",
};

const coldChainSolutionLabels: Record<ColdChainSolution, string> = {
  [ColdChainSolution.Active]: "Active container",
  [ColdChainSolution.Passive]: "Passive packaging",
  [ColdChainSolution.DryIce]: "Dry ice",
};

const baggageSourceLabels: Record<BaggageSource, string> = {
  [BaggageSource.Reconciled]: "Reconciled from the loadsheet payload",
  [BaggageSource.Derived]: "Derived from the passenger count",
};

const hazardClassLabels: Record<HazardClass, string> = {
  [HazardClass.Explosives]: "Explosives",
  [HazardClass.FlammableGas]: "Flammable gas",
  [HazardClass.NonFlammableGas]: "Non-flammable gas",
  [HazardClass.ToxicGas]: "Toxic gas",
  [HazardClass.FlammableLiquid]: "Flammable liquid",
  [HazardClass.FlammableSolid]: "Flammable solid",
  [HazardClass.SpontaneouslyCombustible]: "Spontaneously combustible",
  [HazardClass.DangerousWhenWet]: "Dangerous when wet",
  [HazardClass.Oxidiser]: "Oxidising substance",
  [HazardClass.OrganicPeroxide]: "Organic peroxide",
  [HazardClass.ToxicSubstance]: "Toxic substance",
  [HazardClass.InfectiousSubstance]: "Infectious substance",
  [HazardClass.Radioactive]: "Radioactive material",
  [HazardClass.Corrosive]: "Corrosive substance",
  [HazardClass.Miscellaneous]: "Miscellaneous dangerous goods",
};

const specialHandlingLabels: Record<SpecialHandlingCode, string> = {
  [SpecialHandlingCode.ActiveTemperatureControl]: "Active temperature-controlled container",
  [SpecialHandlingCode.Perishable]: "Perishable",
  [SpecialHandlingCode.PerishableMeat]: "Meat",
  [SpecialHandlingCode.PerishableSeafood]: "Seafood",
  [SpecialHandlingCode.PerishableFlowers]: "Flowers",
  [SpecialHandlingCode.PerishableProduce]: "Fruit and vegetables",
  [SpecialHandlingCode.Foodstuffs]: "Foodstuffs",
  [SpecialHandlingCode.Cool]: "Cool goods, 2 to 8 °C",
  [SpecialHandlingCode.ControlledRoomTemperature]: "Controlled room temperature, 15 to 25 °C",
  [SpecialHandlingCode.Frozen]: "Frozen goods",
  [SpecialHandlingCode.LiveAnimals]: "Live animals",
  [SpecialHandlingCode.LiveAnimalsHold]: "Live animals in the hold",
  [SpecialHandlingCode.HatchingEggs]: "Hatching eggs",
  [SpecialHandlingCode.HumanRemains]: "Human remains",
  [SpecialHandlingCode.LivingOrgans]: "Living human organs",
  [SpecialHandlingCode.Valuable]: "Valuable cargo",
  [SpecialHandlingCode.Vulnerable]: "Vulnerable cargo",
  [SpecialHandlingCode.Pharmaceuticals]: "Pharmaceuticals",
  [SpecialHandlingCode.UndevelopedFilm]: "Undeveloped film",
  [SpecialHandlingCode.Heavy]: "Heavy",
  [SpecialHandlingCode.Outsized]: "Outsized",
  [SpecialHandlingCode.Wet]: "Wet cargo",
  [SpecialHandlingCode.Obnoxious]: "Obnoxious cargo",
  [SpecialHandlingCode.CargoAircraftOnly]: "Cargo aircraft only",
  [SpecialHandlingCode.MunitionsOfWar]: "Munitions of war",
  [SpecialHandlingCode.SportingWeapons]: "Sporting weapons",
  [SpecialHandlingCode.DryIce]: "Dry ice",
  [SpecialHandlingCode.Magnetised]: "Magnetised material",
  [SpecialHandlingCode.DiplomaticMail]: "Diplomatic mail",
  [SpecialHandlingCode.Mail]: "Mail",
  [SpecialHandlingCode.CompanyMail]: "Company mail",
  [SpecialHandlingCode.Express]: "Express",
  [SpecialHandlingCode.Newspapers]: "Newspapers",
  [SpecialHandlingCode.DangerousGoods]: "Dangerous goods",
  [SpecialHandlingCode.FlammableLiquid]: "Flammable liquid",
  [SpecialHandlingCode.FlammableGas]: "Flammable gas",
  [SpecialHandlingCode.ToxicGas]: "Toxic gas",
  [SpecialHandlingCode.NonFlammableGas]: "Non-flammable gas",
  [SpecialHandlingCode.FlammableSolid]: "Flammable solid",
  [SpecialHandlingCode.SpontaneouslyCombustible]: "Spontaneously combustible",
  [SpecialHandlingCode.DangerousWhenWet]: "Dangerous when wet",
  [SpecialHandlingCode.Oxidiser]: "Oxidiser",
  [SpecialHandlingCode.OrganicPeroxide]: "Organic peroxide",
  [SpecialHandlingCode.Toxic]: "Toxic substance",
  [SpecialHandlingCode.InfectiousSubstance]: "Infectious substance",
  [SpecialHandlingCode.RadioactiveWhite]: "Radioactive, category I-WHITE",
  [SpecialHandlingCode.RadioactiveYellow]: "Radioactive, category II or III-YELLOW",
  [SpecialHandlingCode.Corrosive]: "Corrosive",
  [SpecialHandlingCode.MiscellaneousDangerousGoods]: "Miscellaneous dangerous goods",
  [SpecialHandlingCode.LithiumIon]: "Lithium ion batteries",
  [SpecialHandlingCode.LithiumMetal]: "Lithium metal batteries",
  [SpecialHandlingCode.LithiumIonInEquipment]: "Lithium ion batteries in equipment",
  [SpecialHandlingCode.LithiumMetalInEquipment]: "Lithium metal batteries in equipment",
  [SpecialHandlingCode.ExplosivesOther]: "Explosives",
  [SpecialHandlingCode.ExplosivesDivision14S]: "Explosives, division 1.4S",
  [SpecialHandlingCode.ExplosivesDivision14G]: "Explosives, division 1.4G",
};

const commodityLabels: Record<Commodity, string> = {
  [Commodity.FlowersRoses]: "Cut roses",
  [Commodity.FlowersTulips]: "Cut tulips",
  [Commodity.SalmonFresh]: "Fresh salmon",
  [Commodity.CodFresh]: "Fresh cod",
  [Commodity.LiveLobster]: "Live lobster",
  [Commodity.SnowCrab]: "Snow crab",
  [Commodity.TunaFresh]: "Fresh tuna",
  [Commodity.BeefChilled]: "Chilled beef",
  [Commodity.LambChilled]: "Chilled lamb",
  [Commodity.Cherries]: "Fresh cherries",
  [Commodity.Berries]: "Fresh berries",
  [Commodity.Asparagus]: "Fresh asparagus",
  [Commodity.Mango]: "Fresh mango",
  [Commodity.Cheese]: "Speciality cheese",
  [Commodity.Vaccines]: "Vaccines",
  [Commodity.Insulin]: "Insulin",
  [Commodity.ClinicalTrialKits]: "Clinical trial kits",
  [Commodity.BloodPlasma]: "Blood plasma",
  [Commodity.DiagnosticReagents]: "Diagnostic reagents",
  [Commodity.MedicalDevices]: "Medical devices",
  [Commodity.LivingOrgans]: "Living human organs",
  [Commodity.BiologicalCatB]: "Biological substance, Category B",
  [Commodity.InfectiousCatA]: "Infectious substance, Category A",
  [Commodity.Radiopharmaceuticals]: "Radiopharmaceuticals",
  [Commodity.Horses]: "Horses",
  [Commodity.DayOldChicks]: "Day-old chicks",
  [Commodity.HatchingEggs]: "Hatching eggs",
  [Commodity.TropicalFish]: "Tropical fish",
  [Commodity.BreedingCattle]: "Breeding cattle",
  [Commodity.PetsInHold]: "Pets in the hold",
  [Commodity.ZooTransfer]: "Zoo animal transfer",
  [Commodity.HoneyBees]: "Live honey bees",
  [Commodity.SemiconductorWafers]: "Semiconductor wafers",
  [Commodity.Smartphones]: "Smartphones",
  [Commodity.Servers]: "Server hardware",
  [Commodity.GpuAccelerators]: "GPU accelerators",
  [Commodity.DisplayPanels]: "Display panels",
  [Commodity.NetworkEquipment]: "Network equipment",
  [Commodity.MedicalImaging]: "Medical imaging equipment",
  [Commodity.CameraEquipment]: "Camera equipment",
  [Commodity.LithiumIonStandalone]: "Lithium ion cells",
  [Commodity.LithiumIonInEquipment]: "Lithium ion batteries in equipment",
  [Commodity.LithiumMetalStandalone]: "Lithium metal batteries",
  [Commodity.DryIce]: "Dry ice",
  [Commodity.MagnetisedMaterial]: "Magnetised material",
  [Commodity.EnvironmentallyHazardous]: "Environmentally hazardous substance",
  [Commodity.Paint]: "Paint",
  [Commodity.Aerosols]: "Aerosols",
  [Commodity.CompressedOxygen]: "Compressed oxygen",
  [Commodity.ArgonCompressed]: "Compressed argon",
  [Commodity.FireExtinguishers]: "Fire extinguishers",
  [Commodity.Isopropanol]: "Isopropanol",
  [Commodity.Perfumery]: "Perfumery products",
  [Commodity.SafetyMatches]: "Safety matches",
  [Commodity.CalciumCarbide]: "Calcium carbide",
  [Commodity.HydrogenPeroxide]: "Hydrogen peroxide",
  [Commodity.SodiumHypochlorite]: "Sodium hypochlorite",
  [Commodity.BatteryAcid]: "Battery acid",
  [Commodity.AmmunitionSporting]: "Sporting ammunition",
  [Commodity.Pesticide]: "Pesticide",
  [Commodity.AutoParts]: "Automotive parts",
  [Commodity.VehicleEngines]: "Vehicle engines",
  [Commodity.AirbagInflators]: "Airbag inflators",
  [Commodity.Tyres]: "Vehicle tyres",
  [Commodity.MachineTools]: "Machine tools",
  [Commodity.HydraulicComponents]: "Hydraulic components",
  [Commodity.IndustrialPumps]: "Industrial pumps",
  [Commodity.InjectionMoulds]: "Injection moulds",
  [Commodity.EngineFanBlades]: "Engine fan blades",
  [Commodity.LandingGear]: "Landing gear",
  [Commodity.Avionics]: "Avionics units",
  [Commodity.AircraftTyres]: "Aircraft tyres",
  [Commodity.OxygenGenerators]: "Chemical oxygen generators",
  [Commodity.FastFashion]: "Fast fashion apparel",
  [Commodity.Footwear]: "Footwear",
  [Commodity.ECommerceParcels]: "E-commerce parcels",
  [Commodity.Cosmetics]: "Cosmetics",
  [Commodity.Toys]: "Toys",
  [Commodity.Furniture]: "Flat-pack furniture",
  [Commodity.SportingGoods]: "Sporting goods",
  [Commodity.PrintedMatter]: "Printed matter",
  [Commodity.BankNotes]: "Bank notes",
  [Commodity.GoldBullion]: "Gold bullion",
  [Commodity.Jewellery]: "Jewellery",
  [Commodity.Artwork]: "Fine art",
  [Commodity.DiplomaticMail]: "Diplomatic mail",
  [Commodity.UndevelopedFilm]: "Undeveloped film",
  [Commodity.HumanRemains]: "Human remains",
  [Commodity.SportingWeapons]: "Sporting weapons",
  [Commodity.MunitionsOfWar]: "Munitions of war",
  [Commodity.PostalMail]: "Postal mail",
  [Commodity.CompanyMail]: "Company mail",
  [Commodity.ExpressDocuments]: "Express documents",
  [Commodity.Newspapers]: "Newspapers",
  [Commodity.CoffeeBeans]: "Coffee beans",
  [Commodity.Chocolate]: "Chocolate",
  [Commodity.Spirits]: "Spirits",
  [Commodity.RacingCar]: "Racing car",
  [Commodity.ConcertRig]: "Concert production rig",
  [Commodity.SatelliteComponents]: "Satellite components",
};

export function translateCargoUnitKind(kind: CargoUnitKind): string {
  return cargoUnitKindLabels[kind] ?? kind;
}

export function translateContentClass(contentClass: ContentClass): string {
  return contentClassLabels[contentClass] ?? contentClass;
}

export function translateTransferRole(role: TransferRole): string {
  return transferRoleLabels[role] ?? role;
}

export function translateShipmentStatus(status: ShipmentStatus): string {
  return shipmentStatusLabels[status] ?? status;
}

export function translateOffloadReason(reason: OffloadReason): string {
  return offloadReasonLabels[reason] ?? reason;
}

export function translateColdChainRegime(regime: ColdChainRegime): string {
  return coldChainRegimeLabels[regime] ?? regime;
}

export function translateColdChainRisk(risk: ColdChainRisk): string {
  return coldChainRiskLabels[risk] ?? risk;
}

export function translateColdChainSolution(solution: ColdChainSolution): string {
  return coldChainSolutionLabels[solution] ?? solution;
}

export function translateBaggageSource(source: BaggageSource): string {
  return baggageSourceLabels[source] ?? source;
}

export function translateHazardClass(hazardClass: HazardClass): string {
  return hazardClassLabels[hazardClass] ?? hazardClass;
}

export function translateSpecialHandling(code: SpecialHandlingCode): string {
  return specialHandlingLabels[code];
}

export function translateCommodity(commodity: Commodity): string {
  return commodityLabels[commodity];
}
