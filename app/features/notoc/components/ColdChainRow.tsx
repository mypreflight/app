import { Badge } from "flowbite-react";
import React from "react";
import { coldChainExplanationOf } from "~/features/cargo-manifest/lib/cargoWording";
import { ColdChainRisk } from "~/features/cargo-manifest/model";
import type { NotocColdChain } from "~/features/notoc/model";
import { toHuman } from "~/i18n/translate";

type Props = {
  assessment: NotocColdChain;
};

const RISK_COLOR: Record<ColdChainRisk, string> = {
  [ColdChainRisk.High]: "failure",
  [ColdChainRisk.Elevated]: "warning",
  [ColdChainRisk.Low]: "gray",
};

export function ColdChainRow({ assessment }: Props) {
  const isRoutine = assessment.risk === ColdChainRisk.Low;

  return (
    <article className="flex items-baseline gap-3 border-b border-gray-100 py-1.5 last:border-b-0 dark:border-gray-800">
      <span className="flex w-16 shrink-0">
        <Badge color={RISK_COLOR[assessment.risk]} size="xs" className="px-1.5 py-0 text-xs">
          {toHuman.cargoManifest.coldChainRisk(assessment.risk)}
        </Badge>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold text-gray-900 dark:text-white">{assessment.description}</span>
        <span className="block text-xs text-gray-500 dark:text-gray-400">
          {toHuman.cargoManifest.coldChainRegime(assessment.regime)}
        </span>
        {!isRoutine && (
          <span className="block text-xs text-gray-500 dark:text-gray-400">{coldChainExplanationOf(assessment)}</span>
        )}
      </span>
      <span className="shrink-0 text-right font-mono text-xs text-gray-500 dark:text-gray-400">
        {assessment.marginHours} h margin
      </span>
    </article>
  );
}
