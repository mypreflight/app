import React from "react";
import { LuPackageCheck } from "react-icons/lu";
import { useAuth } from "~/app-state/useAuth";
import { designatorOf } from "~/features/cargo-hold/lib/designator";
import type { Flight } from "~/features/flight/model";
import { DangerousGoodsLine } from "~/features/notoc/components/DangerousGoodsLine";
import { DryIceLine } from "~/features/notoc/components/DryIceLine";
import { NotocCertification } from "~/features/notoc/components/NotocCertification";
import { NotocChangesSummary } from "~/features/notoc/components/NotocChangesSummary";
import { NotocFormHeader } from "~/features/notoc/components/NotocFormHeader";
import { NotocIssuedAt } from "~/features/notoc/components/NotocIssuedAt";
import { NotocPdfButton } from "~/features/notoc/components/NotocPdfButton";
import { NotocSection } from "~/features/notoc/components/NotocSection";
import {
  DangerousGoodsSummary,
  SpecialLoadSummary,
  SpecialPassengerSummary,
} from "~/features/notoc/components/NotocSectionSummaries";
import { NotocUnavailableState } from "~/features/notoc/components/NotocUnavailableState";
import { SpecialLoadLine } from "~/features/notoc/components/SpecialLoadLine";
import { SpecialPassengerLine } from "~/features/notoc/components/SpecialPassengerLine";
import { useFlightNotoc } from "~/features/notoc/hooks/useFlightNotoc";
import { notocFileName } from "~/features/notoc/lib/notocHeader";
import { dangerousGoodsTally, specialHandlingCodesOf, specialPassengerTally } from "~/features/notoc/lib/notocSummary";
import { groupSpecialPassengers } from "~/features/notoc/lib/specialPassengerGroups";
import type { FlightNotoc } from "~/features/notoc/model";
import { toHuman } from "~/i18n/translate";
import { FormSectionLabel } from "~/shared/ui/Form/FormSectionLabel";
import { EmptyState } from "~/shared/ui/Layout/EmptyState";
import { LoadingData } from "~/shared/ui/Table/LoadingStates/LoadingData";

type Props = {
  flight: Flight;
};

function acceptanceOf(notoc: FlightNotoc, flight: Flight, userId: string | null, userName: string | null) {
  if (notoc.acknowledgedById === null || notoc.acknowledgedAt === null) {
    return null;
  }

  const name =
    notoc.acknowledgedById === userId && userName !== null
      ? userName
      : notoc.acknowledgedById === flight.pilot?.id
        ? flight.pilot.name
        : "The operating crew";

  return { name, at: notoc.acknowledgedAt };
}

export function NotocConfirmationStep({ flight }: Props) {
  const state = useFlightNotoc(flight.id);
  const { user } = useAuth();

  if (state.status === "loading") {
    return <LoadingData />;
  }

  if (state.status === "unavailable") {
    return <NotocUnavailableState gap={state.gap} />;
  }

  const { notoc } = state;
  const { header, dangerousGoods, dryIce, specialLoads, specialPassengers, coldChain } = notoc.document;
  const hasCuratedHold = flight.aircraft.holdVariant !== null;
  const stationOfUnloading = flight.destinationAirport.iataCode;
  const acceptance = acceptanceOf(notoc, flight, user?.id ?? null, user?.name ?? null);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <FormSectionLabel>Notification to captain</FormSectionLabel>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {toHuman.notoc.stage(notoc.stage)}, issued <NotocIssuedAt at={notoc.issuedAt} />
          </p>
        </div>
        <NotocPdfButton document={{ notoc, acceptance }} fileName={notocFileName(header)} />
      </div>

      <NotocFormHeader header={header} stationOfUnloading={stationOfUnloading} />

      {notoc.changes !== null && <NotocChangesSummary changes={notoc.changes} />}

      {dangerousGoods.length + dryIce.length === 0 ? (
        <section className="flex flex-col">
          <FormSectionLabel>Dangerous goods</FormSectionLabel>
          <EmptyState icon={LuPackageCheck} title="No dangerous goods loaded" className="pt-4 pb-1" />
        </section>
      ) : (
        <NotocSection
          title="Dangerous goods"
          count={dangerousGoods.length + dryIce.length}
          summary={
            <DangerousGoodsSummary
              tally={dangerousGoodsTally(dangerousGoods, dryIce)}
              cargoAircraftOnly={dangerousGoods.some((entry) => entry.cargoAircraftOnly)}
            />
          }
        >
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {dangerousGoods.map((entry) => (
              <DangerousGoodsLine
                key={`${entry.awb}-${entry.unNumber}`}
                entry={entry}
                hasCuratedHold={hasCuratedHold}
              />
            ))}
            {dryIce.map((entry) => (
              <DryIceLine
                key={`dry-ice-${entry.compartment ?? "loose"}`}
                entry={entry}
                hasCuratedHold={hasCuratedHold}
              />
            ))}
          </ul>
        </NotocSection>
      )}

      {specialLoads.length > 0 && (
        <NotocSection
          title="Special load"
          count={specialLoads.length}
          summary={<SpecialLoadSummary codes={specialHandlingCodesOf(specialLoads)} />}
        >
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {specialLoads.map((load) => (
              <SpecialLoadLine
                key={`${load.awb}-${load.loadingPosition === null ? "loose" : designatorOf(load.loadingPosition)}`}
                load={load}
                coldChain={coldChain}
                hasCuratedHold={hasCuratedHold}
              />
            ))}
          </ul>
        </NotocSection>
      )}

      {specialPassengers.length > 0 && (
        <NotocSection
          title="Special category passengers"
          count={specialPassengers.length}
          summary={<SpecialPassengerSummary tally={specialPassengerTally(specialPassengers)} />}
        >
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {groupSpecialPassengers(specialPassengers).map((group) => (
              <SpecialPassengerLine key={`${group.ssr}-${group.seats[0]}`} group={group} />
            ))}
          </ul>
        </NotocSection>
      )}

      <NotocCertification header={header} acceptance={acceptance} />
    </div>
  );
}
