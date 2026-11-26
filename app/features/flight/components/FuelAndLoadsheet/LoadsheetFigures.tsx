import React from "react";
import type { FlightServiceType, Loadsheet } from "~/features/flight";
import { LoadsheetLoad } from "~/features/flight/components/FuelAndLoadsheet/LoadsheetLoad";
import type { LoadsheetVariant } from "~/features/flight/components/FuelAndLoadsheet/VariantSwitch";
import { occupantsLabel } from "~/features/flight/lib/occupants";
import { NotocStage } from "~/features/notoc/model";

type Props = {
  flightId: string;
  loadsheet: Loadsheet;
  variant: LoadsheetVariant;
  serviceType: FlightServiceType;
};

function Figure({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="flex flex-col">
      <dt className="whitespace-nowrap text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {label}
      </dt>
      <dd className="font-mono text-sm font-bold tabular-nums text-gray-900 dark:text-white">
        {value}
        {unit && <span className="ms-0.5 text-xs font-normal text-gray-500 dark:text-gray-400">{unit}</span>}
      </dd>
    </div>
  );
}

export function LoadsheetFigures({ flightId, loadsheet, variant, serviceType }: Props) {
  const { flightCrew } = loadsheet;
  const crew =
    flightCrew.reliefPilots > 0
      ? `${flightCrew.pilots}+${flightCrew.reliefPilots}/${flightCrew.cabinCrew}`
      : `${flightCrew.pilots}/${flightCrew.cabinCrew}`;

  return (
    <div className="flex flex-col gap-4">
      <dl className="flex flex-wrap gap-x-6 gap-y-2">
        <Figure label={occupantsLabel(serviceType)} value={loadsheet.passengers.toString()} />
        <Figure label="Crew" value={crew} />
        <Figure label="ZFW" value={loadsheet.zeroFuelWeight.toString()} unit="t" />
        <Figure label="Payload" value={loadsheet.payload.toString()} unit="t" />
        <Figure label="Cargo" value={loadsheet.cargo.toString()} unit="t" />
        <Figure label="Block fuel" value={loadsheet.blockFuel.toString()} unit="t" />
      </dl>

      <LoadsheetLoad flightId={flightId} stage={variant === "final" ? NotocStage.Final : NotocStage.Preliminary} />
    </div>
  );
}
