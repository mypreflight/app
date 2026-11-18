import { Badge, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from "flowbite-react";
import React from "react";
import { Link } from "react-router";
import type { CabinLayout } from "~/features/cabin-layout/model";
import { FormattedIcaoDate } from "~/shared/ui/Date/FormattedIcaoDate";
import { LinkedTableRow } from "~/shared/ui/Table/LinkedTableRow";
import { denseTableTheme } from "~/styles/theme";

type Props = {
  layouts: CabinLayout[];
};

export function CabinLayoutListTable({ layouts }: Props) {
  return (
    <Table theme={denseTableTheme}>
      <TableHead>
        <TableRow>
          <TableHeadCell>Layout</TableHeadCell>
          <TableHeadCell>Airline</TableHeadCell>
          <TableHeadCell>Aircraft type</TableHeadCell>
          <TableHeadCell>Variant</TableHeadCell>
          <TableHeadCell>Read from</TableHeadCell>
          <TableHeadCell>First seen</TableHeadCell>
          <TableHeadCell>
            <span className="sr-only">Status</span>
          </TableHeadCell>
        </TableRow>
      </TableHead>
      <TableBody className="divide-y divide-gray-200 dark:divide-gray-800">
        {layouts.map((layout) => (
          <LinkedTableRow key={layout.id} to={`/cabin-layouts/${layout.id}`}>
            <TableCell className="font-mono font-bold text-gray-900 dark:text-white">
              <Link
                to={`/cabin-layouts/${layout.id}`}
                viewTransition
                className="hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                {layout.id}
              </Link>
            </TableCell>
            <TableCell className="font-mono">{layout.airlineIata}</TableCell>
            <TableCell className="font-mono">{layout.aircraftIata}</TableCell>
            <TableCell className="font-mono">{layout.variant ?? "—"}</TableCell>
            <TableCell className="font-mono text-xs">{layout.sourceSlugs.join(", ")}</TableCell>
            <TableCell>
              <FormattedIcaoDate date={new Date(layout.firstSeenAt)} />
            </TableCell>
            <TableCell>
              {layout.retiredAt !== null && (
                <Badge color="warning" size="xs">
                  Withdrawn
                </Badge>
              )}
            </TableCell>
          </LinkedTableRow>
        ))}
      </TableBody>
    </Table>
  );
}
