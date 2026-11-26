import { Badge } from "flowbite-react";
import React from "react";
import type { SpecialHandlingCode } from "~/features/cargo-manifest/model";
import type { SpecialServiceRequest } from "~/features/flight/model";
import type { Tally } from "~/features/notoc/lib/notocSummary";
import { toHuman } from "~/i18n/translate";

const NO_BREAK_SPACE = " ";

type Term = {
  key: string;
  label: string;
  count: number;
  title?: string;
};

function Terms({ terms, code }: { terms: Term[]; code: boolean }) {
  return terms.map((term, index) => (
    <React.Fragment key={term.key}>
      <span title={term.title} className={code ? "font-mono" : undefined}>
        {term.label}
      </span>
      {term.count > 1 && (
        <>
          {NO_BREAK_SPACE}
          <span className="font-mono text-gray-500 dark:text-gray-400">×{term.count}</span>
        </>
      )}
      {index < terms.length - 1 && <span className="text-gray-400 dark:text-gray-500">{`${NO_BREAK_SPACE}· `}</span>}
    </React.Fragment>
  ));
}

export function DangerousGoodsSummary({
  tally,
  cargoAircraftOnly,
}: {
  tally: Tally<string>[];
  cargoAircraftOnly: boolean;
}) {
  return (
    <>
      <Terms terms={tally.map(({ item, count }) => ({ key: item, label: item, count }))} code={false} />
      {cargoAircraftOnly && (
        <Badge color="failure" size="xs" className="ms-2 inline-flex px-1.5 py-0 align-middle text-xs">
          Cargo aircraft only
        </Badge>
      )}
    </>
  );
}

export function SpecialLoadSummary({ codes }: { codes: SpecialHandlingCode[] }) {
  return (
    <Terms
      terms={codes.map((code) => ({
        key: code,
        label: code,
        count: 1,
        title: toHuman.cargoManifest.specialHandling(code),
      }))}
      code
    />
  );
}

export function SpecialPassengerSummary({ tally }: { tally: Tally<SpecialServiceRequest>[] }) {
  return (
    <Terms
      terms={tally.map(({ item, count }) => ({
        key: item,
        label: item,
        count,
        title: toHuman.flight.specialServiceRequest(item),
      }))}
      code
    />
  );
}
