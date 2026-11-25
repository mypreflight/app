import { designatorOf, samePosition } from "~/features/cargo-hold/lib/designator";
import { compartmentsOf, type HoldCompartment, type HoldVariant, positionsOf } from "~/features/cargo-hold/model";
import type { FlightCargoManifest, SegregationAdvisory } from "~/features/cargo-manifest/model";
import { ShipmentStatus, SpecialHandlingCode, unitTotalKg } from "~/features/cargo-manifest/model";
import { FlightServiceType } from "~/features/flight";
import { toHuman } from "~/i18n/translate";

export enum AdvisoryOutcome {
  Raised = "raised",
  Clear = "clear",
  NotApplicable = "not_applicable",
}

export type AdvisoryFinding = {
  headline: string;
  basis: string[];
};

export type AdvisoryCheck = {
  key: string;
  label: string;
  outcome: AdvisoryOutcome;
  reason: string | null;
  findings: AdvisoryFinding[];
};

export type AdvisoryInput = {
  manifest: FlightCargoManifest;
  variant: HoldVariant | null;
  serviceType: FlightServiceType;
  holdDataNote: string;
};

function kg(value: number): string {
  return `${value.toLocaleString()} kg`;
}

function compartmentsByNumber(variant: HoldVariant | null): Map<number, HoldCompartment> {
  if (variant === null) {
    return new Map();
  }
  return new Map(compartmentsOf(variant).map((compartment) => [compartment.number, compartment]));
}

function resolve(key: string, label: string, findings: AdvisoryFinding[]): AdvisoryCheck {
  return {
    key,
    label,
    outcome: findings.length > 0 ? AdvisoryOutcome.Raised : AdvisoryOutcome.Clear,
    reason: null,
    findings,
  };
}

function notApplicable(key: string, label: string, reason: string): AdvisoryCheck {
  return { key, label, outcome: AdvisoryOutcome.NotApplicable, reason, findings: [] };
}

function dryIceVentilation({ manifest, variant, holdDataNote }: AdvisoryInput): AdvisoryCheck {
  const key = "dry-ice-ventilation";
  const label = "Dry ice in a ventilated compartment";

  if (variant === null) {
    return notApplicable(key, label, holdDataNote);
  }

  const compartments = compartmentsByNumber(variant);
  const findings = manifest.compartmentLoad
    .filter((entry) => entry.dryIceKg > 0 && compartments.get(entry.compartment)?.ventilated === false)
    .map((entry) => ({
      headline: `Compartment ${entry.compartment} carries ${kg(entry.dryIceKg)} of dry ice and is not ventilated`,
      basis: [`Dry ice ${kg(entry.dryIceKg)}`, "Compartment ventilated: no"],
    }));

  return resolve(key, label, findings);
}

function liveAnimalConditions({ manifest, variant, holdDataNote }: AdvisoryInput): AdvisoryCheck {
  const key = "live-animal-conditions";
  const label = "Live animals in a heated and ventilated compartment";

  if (variant === null) {
    return notApplicable(key, label, holdDataNote);
  }

  const compartments = compartmentsByNumber(variant);
  const findings: AdvisoryFinding[] = [];

  for (const unit of manifest.units) {
    for (const shipment of unit.shipments) {
      if (!shipment.shc.includes(SpecialHandlingCode.LiveAnimals) || unit.compartment === null) {
        continue;
      }
      const compartment = compartments.get(unit.compartment);
      if (compartment === undefined || (compartment.heated && compartment.ventilated)) {
        continue;
      }
      const lacking = [compartment.heated ? null : "not heated", compartment.ventilated ? null : "not ventilated"]
        .filter((entry) => entry !== null)
        .join(" and ");
      findings.push({
        headline: `${shipment.description} sits in compartment ${unit.compartment}, which is ${lacking}`,
        basis: [`AWB ${shipment.awb}`, `Handling codes ${shipment.shc.join(", ")}`, `Compartment ${lacking}`],
      });
    }
  }

  return resolve(key, label, findings);
}

function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

function carriersOf(
  manifest: FlightCargoManifest,
  { compartment, deck }: SegregationAdvisory,
  code: SpecialHandlingCode,
): string[] {
  return manifest.units
    .filter((unit) => unit.compartment === compartment && unit.deck === deck)
    .flatMap((unit) => unit.shipments)
    .filter((shipment) => shipment.status === ShipmentStatus.Loaded && shipment.shc.includes(code))
    .map((shipment) => `AWB ${shipment.awb} ${code}`);
}

function segregation({ manifest, holdDataNote }: AdvisoryInput): AdvisoryCheck {
  const key = "segregation";
  const label = "Incompatible loads kept in separate compartments";

  if (manifest.holdVariant === null) {
    return notApplicable(key, label, holdDataNote);
  }

  const findings = manifest.segregationAdvisories.map((advisory) => ({
    headline: `Compartment ${advisory.compartment} carries ${lowerFirst(toHuman.cargoManifest.specialHandling(advisory.one))} together with ${lowerFirst(toHuman.cargoManifest.specialHandling(advisory.other))}`,
    basis: [...carriersOf(manifest, advisory, advisory.one), ...carriersOf(manifest, advisory, advisory.other)],
  }));

  return resolve(key, label, findings);
}

function cargoAircraftOnly({ manifest, serviceType }: AdvisoryInput): AdvisoryCheck {
  const key = "cargo-aircraft-only";
  const label = "Cargo-aircraft-only load kept off passenger flights";

  if (serviceType !== FlightServiceType.Passenger) {
    return notApplicable(key, label, "This flight carries no passengers, so the restriction does not apply.");
  }

  const findings = manifest.units.flatMap((unit) =>
    unit.shipments
      .filter((shipment) => shipment.dangerousGoods?.cargoAircraftOnly === true)
      .map((shipment) => ({
        headline: `${shipment.description} is restricted to cargo aircraft and this flight carries passengers`,
        basis: [
          `AWB ${shipment.awb}`,
          `UN${shipment.dangerousGoods?.unNumber} class ${shipment.dangerousGoods?.hazardClass}`,
          unit.loadingPosition === null ? "Loose load" : `Position ${designatorOf(unit.loadingPosition)}`,
        ],
      })),
  );

  return resolve(key, label, findings);
}

function positionWeight({ manifest, variant, holdDataNote }: AdvisoryInput): AdvisoryCheck {
  const key = "position-weight";
  const label = "Unit weight within its position limit";

  if (variant === null) {
    return notApplicable(key, label, holdDataNote);
  }

  const positions = positionsOf(variant);

  const findings = manifest.units.flatMap((unit) => {
    const loadingPosition = unit.loadingPosition;
    if (loadingPosition === null) {
      return [];
    }
    const limit = positions.find((position) => samePosition(position, loadingPosition))?.maxWeightKg;
    const total = unitTotalKg(unit);
    if (limit === undefined || total <= limit) {
      return [];
    }
    return [
      {
        headline: `${unit.uldCode ?? "Unit"} at ${designatorOf(loadingPosition)} carries ${kg(total)} against a ${kg(limit)} limit`,
        basis: [`Contents ${kg(unit.grossKg)}`, `Tare ${kg(unit.tareKg)}`, `Position limit ${kg(limit)}`],
      },
    ];
  });

  return resolve(key, label, findings);
}

function compartmentLimits({ manifest, variant, holdDataNote }: AdvisoryInput): AdvisoryCheck {
  const key = "compartment-limits";
  const label = "Compartment load within its weight and volume limits";

  if (variant === null) {
    return notApplicable(key, label, holdDataNote);
  }

  const compartments = compartmentsByNumber(variant);
  const findings: AdvisoryFinding[] = [];

  for (const entry of manifest.compartmentLoad) {
    const compartment = compartments.get(entry.compartment);
    if (compartment === undefined) {
      continue;
    }

    if (entry.weightKg > compartment.maxWeightKg) {
      findings.push({
        headline: `Compartment ${entry.compartment} carries ${kg(entry.weightKg)} against a ${kg(compartment.maxWeightKg)} limit`,
        basis: [`Load ${kg(entry.weightKg)}`, `Compartment limit ${kg(compartment.maxWeightKg)}`],
      });
    }

    const volume = manifest.units
      .filter((unit) => unit.compartment === entry.compartment)
      .reduce((sum, unit) => sum + unit.volumeM3, 0);

    if (volume > compartment.volumeM3) {
      findings.push({
        headline: `Compartment ${entry.compartment} holds ${volume.toFixed(1)} m³ against ${compartment.volumeM3} m³ usable`,
        basis: [`Contents ${volume.toFixed(1)} m³`, `Usable volume ${compartment.volumeM3} m³`],
      });
    }
  }

  return resolve(key, label, findings);
}

const CHECKS = [
  dryIceVentilation,
  liveAnimalConditions,
  segregation,
  cargoAircraftOnly,
  positionWeight,
  compartmentLimits,
];

export function loadAdvisories(input: AdvisoryInput): AdvisoryCheck[] {
  return CHECKS.map((check) => check(input));
}
