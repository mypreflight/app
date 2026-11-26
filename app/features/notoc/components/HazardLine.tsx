import { Badge, Button } from "flowbite-react";
import React, { useState } from "react";
import { responseCodeOf } from "~/features/cargo-manifest/lib/cargoWording";
import { DrillModal } from "~/features/notoc/components/DrillModal";
import type { NotocDrill } from "~/features/notoc/model";

type Props = {
  classOrDivision: string;
  properShippingName: string;
  unNumber: string;
  traits: string[];
  reference: string;
  cargoAircraftOnly: boolean;
  placement: string;
  uldId: string | null;
  drill: NotocDrill;
};

export function HazardLine({
  classOrDivision,
  properShippingName,
  unNumber,
  traits,
  reference,
  cargoAircraftOnly,
  placement,
  uldId,
  drill,
}: Props) {
  const [drillOpen, setDrillOpen] = useState(false);

  return (
    <li className="flex items-start gap-3 py-2.5">
      <span className="w-10 shrink-0 font-mono text-base font-bold text-gray-900 dark:text-white sm:w-12">
        {classOrDivision}
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          {properShippingName}{" "}
          <span className="font-mono font-normal text-gray-500 dark:text-gray-400">{unNumber}</span>
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{traits.join(" · ")}</p>
        <p className="font-mono text-xs text-gray-700 dark:text-gray-300">{reference}</p>
        {cargoAircraftOnly && (
          <Badge color="failure" size="xs" className="mt-1 w-fit px-1.5 py-0 text-xs">
            Cargo aircraft only
          </Badge>
        )}
      </div>

      <div className="shrink-0 text-right">
        <span className="block font-mono text-sm font-bold text-gray-900 dark:text-white">{placement}</span>
        {uldId !== null && <span className="block font-mono text-xs text-gray-500 dark:text-gray-400">{uldId}</span>}
      </div>

      <Button
        size="xs"
        color="light"
        className="shrink-0 font-mono"
        aria-label={`Emergency response drill ${responseCodeOf(drill.responseCode)} for ${properShippingName}`}
        onClick={() => setDrillOpen(true)}
      >
        {responseCodeOf(drill.responseCode)}
      </Button>

      {drillOpen && (
        <DrillModal drill={drill} subject={`${properShippingName} ${unNumber}`} close={() => setDrillOpen(false)} />
      )}
    </li>
  );
}
