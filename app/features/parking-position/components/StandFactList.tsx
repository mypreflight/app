import React from "react";
import type { StandFact } from "~/features/parking-position/lib/standFacts";

type Props = {
  facts: StandFact[];
};

export function StandFactList({ facts }: Props) {
  return (
    <span className="flex flex-wrap items-baseline gap-x-1.5">
      {facts.map((fact, factIndex) => (
        <React.Fragment key={fact.text}>
          {factIndex > 0 ? <span className="text-gray-300 dark:text-gray-700">·</span> : null}
          <span className={fact.available ? undefined : "text-gray-500 dark:text-gray-400"}>{fact.text}</span>
        </React.Fragment>
      ))}
    </span>
  );
}
