import { Badge } from "flowbite-react";
import React from "react";
import { kilograms, placementOf, supplementaryLinesOf } from "~/features/notoc/lib/notocFormat";
import type { NotocColdChain, NotocSpecialLoad } from "~/features/notoc/model";
import { toHuman } from "~/i18n/translate";

type Props = {
  load: NotocSpecialLoad;
  coldChain: NotocColdChain[];
  hasCuratedHold: boolean;
};

export function SpecialLoadLine({ load, coldChain, hasCuratedHold }: Props) {
  const pieces = load.pieces === 1 ? "1 pc" : `${load.pieces} pcs`;
  const lines = supplementaryLinesOf(load, coldChain);

  return (
    <li className="flex items-start gap-3 py-2.5">
      <span className="flex w-12 shrink-0 flex-col items-start gap-1">
        {load.shc.map((code) => (
          <Badge
            key={code}
            color="gray"
            size="xs"
            className="px-1.5 py-0 font-mono text-xs"
            title={toHuman.cargoManifest.specialHandling(code)}
          >
            {code}
          </Badge>
        ))}
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{load.description}</p>
        <p className="font-mono text-xs text-gray-700 dark:text-gray-300">
          {load.awb} · {pieces} · {kilograms(load.grossKg)}
        </p>
        {lines.length > 0 && (
          <ul className="mt-1 font-mono text-xs text-gray-600 dark:text-gray-400">
            {lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="shrink-0 text-right">
        <span className="block font-mono text-sm font-bold text-gray-900 dark:text-white">
          {placementOf(load, hasCuratedHold)}
        </span>
        {load.uldId !== null && (
          <span className="block font-mono text-xs text-gray-500 dark:text-gray-400">{load.uldId}</span>
        )}
      </div>
    </li>
  );
}
