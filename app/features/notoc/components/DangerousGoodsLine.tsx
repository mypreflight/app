import React from "react";
import { HazardLine } from "~/features/notoc/components/HazardLine";
import { placementOf, quantityOf, unNumberOf } from "~/features/notoc/lib/notocFormat";
import type { NotocDangerousGoods } from "~/features/notoc/model";
import { toHuman } from "~/i18n/translate";

type Props = {
  entry: NotocDangerousGoods;
  hasCuratedHold: boolean;
};

export function DangerousGoodsLine({ entry, hasCuratedHold }: Props) {
  const traits = [
    toHuman.cargoManifest.hazardClass(entry.hazardClass),
    ...(entry.subsidiaryRisk === null ? [] : [`subsidiary ${entry.subsidiaryRisk}`]),
    ...(entry.packingGroup === null ? [] : [`PG ${entry.packingGroup}`]),
    entry.impCode,
  ];

  return (
    <HazardLine
      classOrDivision={entry.classOrDivision}
      properShippingName={entry.properShippingName}
      unNumber={unNumberOf(entry)}
      traits={traits}
      reference={`${entry.awb} · ${quantityOf(entry)}`}
      cargoAircraftOnly={entry.cargoAircraftOnly}
      placement={placementOf(entry, hasCuratedHold)}
      uldId={entry.uldId}
      drill={entry.drill}
    />
  );
}
