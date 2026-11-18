import { Badge, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from "flowbite-react";
import React, { useMemo } from "react";
import { HiChevronRight } from "react-icons/hi";
import { Link } from "react-router";
import type { Aircraft } from "~/features/aircraft";
import { CabinCoverageBadge } from "~/features/aircraft/components/Aircraft/CabinCoverageBadge";
import { aircraftStateColors } from "~/features/aircraft/i18n";
import { formatCruiseSpeed, formatServiceCeiling, formatWeightCategory } from "~/features/airframe/lib/formatAirframe";
import type { Airport } from "~/features/airport";
import { AircraftListCard } from "~/features/operator/components/Table/AircraftListCard";
import { toHuman } from "~/i18n/translate";
import { LinkedTableRow } from "~/shared/ui/Table/LinkedTableRow";
import { denseTableTheme } from "~/styles/theme";

type Props = {
  operatorId: string;
  aircraft: Aircraft[];
  airports: Airport[];
};

export function AircraftListTable({ operatorId, aircraft, airports }: Props) {
  const airportsById = useMemo(() => new Map(airports.map((airport) => [airport.id, airport])), [airports]);

  return (
    <>
      <div className="flex flex-col gap-2.5 md:hidden">
        {aircraft.map((each: Aircraft) => (
          <AircraftListCard
            key={each.id}
            aircraft={each}
            operatorId={operatorId}
            baseAirport={each.baseAirport ? (airportsById.get(each.baseAirport.id) ?? null) : null}
          />
        ))}
      </div>

      <Table theme={denseTableTheme} className="hidden md:table">
        <TableHead>
          <TableRow>
            <TableHeadCell>Registration</TableHeadCell>
            <TableHeadCell>State</TableHeadCell>
            <TableHeadCell>SELCAL</TableHeadCell>
            <TableHeadCell>Performance</TableHeadCell>
            <TableHeadCell>Base</TableHeadCell>
            <TableHeadCell className="hidden @4xl:table-cell">Livery</TableHeadCell>
            <TableHeadCell className="hidden @4xl:table-cell">Cabin</TableHeadCell>
            <TableHeadCell>
              <span className="sr-only">Details</span>
            </TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody className="divide-y divide-gray-200 dark:divide-gray-800">
          {aircraft.map((each: Aircraft) => {
            const baseAirport = each.baseAirport ? (airportsById.get(each.baseAirport.id) ?? null) : null;
            const detailsPath = `/operators/${operatorId}/aircraft/${each.id}`;

            return (
              <LinkedTableRow key={each.id} to={detailsPath}>
                <TableCell>
                  <Link
                    to={detailsPath}
                    viewTransition
                    className="block font-mono text-sm font-bold text-gray-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400"
                  >
                    {each.registration}
                  </Link>
                  <span className="block text-xs text-gray-500 dark:text-gray-400">{each.airframe.name}</span>
                </TableCell>
                <TableCell>
                  <Badge color={aircraftStateColors[each.currentState]} size="sm" className="w-fit">
                    {toHuman.aircraft.state(each.currentState)}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-gray-700 dark:text-gray-300">{each.selcal || "—"}</TableCell>
                <TableCell>
                  <span className="block font-medium text-gray-900 dark:text-white">
                    {formatWeightCategory(each.airframe.weightCategory)} · {each.airframe.performanceCode}
                  </span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400">
                    {formatCruiseSpeed(each.airframe.cruiseSpeed)} ·{" "}
                    {formatServiceCeiling(each.airframe.serviceCeiling)}
                  </span>
                </TableCell>
                <TableCell>
                  {baseAirport ? (
                    <>
                      <span className="block font-mono font-bold text-gray-900 dark:text-white">
                        {baseAirport.iataCode}
                      </span>
                      <span className="block max-w-44 truncate text-xs text-gray-500 dark:text-gray-400">
                        {baseAirport.name}
                      </span>
                    </>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="hidden max-w-40 truncate text-gray-700 @4xl:table-cell dark:text-gray-300">
                  {each.livery}
                </TableCell>
                <TableCell className="hidden @4xl:table-cell">
                  <CabinCoverageBadge aircraft={each} />
                </TableCell>
                <TableCell className="w-px">
                  <Link
                    to={detailsPath}
                    viewTransition
                    aria-label={`${each.registration} details`}
                    className="flex text-gray-500 transition-colors hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                  >
                    <HiChevronRight className="size-4" aria-hidden={true} />
                  </Link>
                </TableCell>
              </LinkedTableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
}
