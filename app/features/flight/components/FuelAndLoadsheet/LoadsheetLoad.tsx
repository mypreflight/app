import React from "react";
import { ColdChainRow } from "~/features/notoc/components/ColdChainRow";
import { useFlightNotoc } from "~/features/notoc/hooks/useFlightNotoc";
import { kilograms } from "~/features/notoc/lib/notocFormat";
import type { NotocLoadSummary, NotocStage } from "~/features/notoc/model";
import { toHuman } from "~/i18n/translate";
import { FieldLabel } from "~/shared/ui/Display/FieldLabel";

type Props = {
  flightId: string;
  stage: NotocStage;
};

function units(summary: NotocLoadSummary): string {
  const parts = [
    `${summary.containerCount} ${summary.containerCount === 1 ? "container" : "containers"}`,
    `${summary.palletCount} ${summary.palletCount === 1 ? "pallet" : "pallets"}`,
    `${summary.looseLotCount} loose ${summary.looseLotCount === 1 ? "lot" : "lots"}`,
  ];

  return parts.join(" · ");
}

function LoadLine({ label, kg, note, total = false }: { label: string; kg: number; note?: string; total?: boolean }) {
  return (
    <li
      className={
        total
          ? "flex items-baseline gap-3 border-t border-gray-300 pt-1.5 dark:border-gray-600"
          : "flex items-baseline gap-3"
      }
    >
      <span
        className={
          total
            ? "flex-1 text-sm font-semibold text-gray-900 dark:text-white"
            : "flex-1 text-sm text-gray-700 dark:text-gray-300"
        }
      >
        {label}
      </span>
      {note !== undefined && <span className="font-mono text-xs text-gray-500 dark:text-gray-400">{note}</span>}
      <span className="w-24 text-right font-mono text-sm font-bold tabular-nums text-gray-900 dark:text-white">
        {kilograms(kg)}
      </span>
    </li>
  );
}

export function LoadsheetLoad({ flightId, stage }: Props) {
  const state = useFlightNotoc(flightId, stage);

  if (state.status !== "ready" || state.notoc.stage !== stage) {
    return null;
  }

  const { summary, coldChain } = state.notoc.document;

  return (
    <>
      <section className="flex flex-col gap-1.5">
        <FieldLabel>Load in compartments</FieldLabel>
        <ul className="flex flex-col gap-1">
          {summary.compartments.map((compartment) => (
            <LoadLine
              key={`${compartment.deck}-${compartment.compartment}`}
              label={`${toHuman.cargoHold.deck(compartment.deck)} ${compartment.compartment}`}
              kg={compartment.weightKg}
              note={compartment.dryIceKg > 0 ? `dry ice ${kilograms(compartment.dryIceKg)}` : undefined}
            />
          ))}
          <LoadLine label="Deadload" kg={summary.deadloadKg} total />
        </ul>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Cargo {kilograms(summary.cargoKg)} and baggage {kilograms(summary.baggageKg)}, in {units(summary)}
        </p>
      </section>

      {coldChain.length > 0 && (
        <section className="flex flex-col gap-1">
          <FieldLabel>Cold chain · advisory</FieldLabel>
          <div className="flex flex-col">
            {coldChain.map((assessment) => (
              <ColdChainRow key={assessment.awb} assessment={assessment} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
