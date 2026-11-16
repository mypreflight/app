import { Button } from "flowbite-react";
import React, { useMemo } from "react";
import { LuUsers } from "react-icons/lu";
import { Link } from "react-router";
import { OPENED_FROM_BRIEFING } from "~/features/flight/components/Briefing/BriefingDocumentLink";
import { cabinCounts, requestCounts, requestedServices } from "~/features/flight/lib/passengerInformation";
import type { ManifestPassenger, SpecialServiceRequest } from "~/features/flight/model";
import { toHuman } from "~/i18n/translate";
import { StatBlock } from "~/shared/ui/Display/StatBlock";
import { CardHeader } from "~/shared/ui/Layout/CardHeader";
import { Container } from "~/shared/ui/Layout/Container";

type Props = {
  passengers: ManifestPassenger[];
  pilHref: (request: SpecialServiceRequest | null) => string;
  cabinHref: string;
};

export function PassengersSummaryCard({ passengers, pilHref, cabinHref }: Props) {
  const services = useMemo(() => requestedServices(passengers), [passengers]);
  const counts = useMemo(() => requestCounts(services), [services]);
  const cabins = useMemo(() => cabinCounts(passengers), [passengers]);

  return (
    <Container
      padding="condensed"
      header={
        <CardHeader
          title="Passengers"
          actions={
            <span className="text-xs text-gray-500 dark:text-gray-400">
              <span className="font-mono tabular-nums">{passengers.length}</span> on the manifest
            </span>
          }
        />
      }
    >
      <div className="grid grid-cols-4 gap-3">
        {cabins.map(({ cabin, count }) => (
          <StatBlock key={cabin} label={toHuman.cabinLayout.cabinClass(cabin)} value={count} />
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Special requests</h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            <span className="font-mono tabular-nums">{services.length}</span> passengers
          </span>
        </div>
        {counts.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">None on this flight.</p>
        ) : (
          <ul className="flex flex-wrap gap-1.5">
            {counts.map(({ request, count }) => (
              <li key={request}>
                <Link
                  to={pilHref(request)}
                  state={OPENED_FROM_BRIEFING}
                  title={toHuman.flight.specialServiceRequest(request)}
                  className="inline-flex h-7 items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-2 text-xs text-gray-600 transition-colors hover:border-indigo-200 hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 pointer-coarse:h-11 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-indigo-500/40 dark:hover:bg-indigo-500/10"
                >
                  <span className="font-mono font-bold text-gray-900 dark:text-white">{request}</span>
                  <span className="font-mono tabular-nums">{count}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button as={Link} to={pilHref(null)} state={OPENED_FROM_BRIEFING} color="alternative" size="xs">
          <LuUsers className="me-1.5 size-3.5" aria-hidden={true} />
          Open PIL
        </Button>
        <Button as={Link} to={cabinHref} state={OPENED_FROM_BRIEFING} color="light" size="xs">
          Cabin and manifest
        </Button>
      </div>
    </Container>
  );
}
