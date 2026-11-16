import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from "flowbite-react";
import React, { useMemo } from "react";
import { Deck } from "~/features/cabin-layout/model";
import { cabinCounts, requestCounts, requestedServices } from "~/features/flight/lib/passengerInformation";
import type { ManifestPassenger, SpecialServiceRequest } from "~/features/flight/model";
import { toHuman } from "~/i18n/translate";
import { StatBlock } from "~/shared/ui/Display/StatBlock";
import { FilterChoice } from "~/shared/ui/Filter/FilterChoice";

type Props = {
  passengers: ManifestPassenger[];
  request: SpecialServiceRequest | null;
  onRequestChange: (request: SpecialServiceRequest | null) => void;
};

const tableTheme = {
  head: {
    cell: {
      base: "sticky top-0 z-10 bg-gray-50 px-3 py-2 dark:bg-gray-800",
    },
  },
};

export function PassengerInformationList({ passengers, request, onRequestChange }: Props) {
  const services = useMemo(() => requestedServices(passengers), [passengers]);
  const counts = useMemo(() => requestCounts(services), [services]);
  const cabins = useMemo(() => cabinCounts(passengers), [passengers]);
  const shown = request === null ? services : services.filter((service) => service.ssr === request);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cabins.map(({ cabin, count }) => (
          <StatBlock key={cabin} label={toHuman.cabinLayout.cabinClass(cabin)} value={count} />
        ))}
      </div>

      {services.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No passenger on this flight has a special service request.
        </p>
      ) : (
        <>
          <fieldset className="m-0 flex min-w-0 flex-wrap gap-1.5 border-0 p-0">
            <legend className="sr-only">Show requests</legend>
            <FilterChoice
              label="All"
              count={services.length}
              isSelected={request === null}
              onSelect={() => onRequestChange(null)}
            />
            {counts.map(({ request: code, count }) => (
              <FilterChoice
                key={code}
                label={code}
                count={count}
                isSelected={request === code}
                onSelect={() => onRequestChange(request === code ? null : code)}
              />
            ))}
          </fieldset>

          <div className="overflow-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <Table theme={tableTheme}>
              <TableHead>
                <TableRow>
                  <TableHeadCell>Seat</TableHeadCell>
                  <TableHeadCell>Passenger</TableHeadCell>
                  <TableHeadCell>Cabin</TableHeadCell>
                  <TableHeadCell>Request</TableHeadCell>
                  <TableHeadCell>Booking</TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody className="divide-y">
                {shown.map((service) => (
                  <TableRow key={`${service.deck}-${service.designator}`}>
                    <TableCell className="whitespace-nowrap px-3 py-2">
                      <span className="font-mono font-bold text-gray-900 dark:text-white">{service.designator}</span>
                      {service.deck === Deck.Upper && (
                        <span className="ms-1.5 text-xs text-gray-500 dark:text-gray-400">upper deck</span>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-3 py-2 font-medium text-gray-900 dark:text-white">
                      {service.name}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-3 py-2">
                      {toHuman.cabinLayout.cabinClass(service.cabin)}
                    </TableCell>
                    <TableCell className="min-w-44 whitespace-normal px-3 py-2">
                      <span className="me-1.5 rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs font-bold text-gray-900 dark:bg-gray-800 dark:text-white">
                        {service.ssr}
                      </span>
                      <span className="text-gray-600 dark:text-gray-300">
                        {toHuman.flight.specialServiceRequest(service.ssr)}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-3 py-2 font-mono text-gray-500 dark:text-gray-400">
                      {service.pnr}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
