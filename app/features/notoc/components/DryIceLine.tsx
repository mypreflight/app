import React from "react";
import { HazardLine } from "~/features/notoc/components/HazardLine";
import { DRY_ICE, dryIceQuantityOf, placementOf } from "~/features/notoc/lib/notocFormat";
import type { NotocDryIce } from "~/features/notoc/model";
import { toHuman } from "~/i18n/translate";

type Props = {
  entry: NotocDryIce;
  hasCuratedHold: boolean;
};

export function DryIceLine({ entry, hasCuratedHold }: Props) {
  return (
    <HazardLine
      classOrDivision={DRY_ICE.classOrDivision}
      properShippingName={DRY_ICE.properShippingName}
      unNumber={DRY_ICE.unNumber}
      traits={[toHuman.cargoManifest.hazardClass(DRY_ICE.classOrDivision), DRY_ICE.impCode]}
      reference={dryIceQuantityOf(entry)}
      cargoAircraftOnly={false}
      placement={placementOf({ loadingPosition: null, compartment: entry.compartment }, hasCuratedHold)}
      uldId={null}
      drill={entry.drill}
    />
  );
}
