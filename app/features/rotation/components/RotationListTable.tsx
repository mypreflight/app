import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from "flowbite-react";
import React from "react";
import { HiChevronRight } from "react-icons/hi";
import { Link } from "react-router";
import type { Rotation } from "~/features/rotation";
import { RotationStatusBadge } from "~/features/rotation/components/RotationStatusBadge";
import { formatDate } from "~/shared/lib/time";
import { LinkedTableRow } from "~/shared/ui/Table/LinkedTableRow";
import { denseTableTheme } from "~/styles/theme";

type Props = {
  operatorId: string;
  rotations: Rotation[];
  pilotNames: Record<string, string>;
};

function departureDate(rotation: Rotation): string {
  const first = rotation.legs[0];
  return first ? formatDate(first.offBlockTime).split(" ")[0] : "—";
}

function wordsOf(name: string): { word: string; offset: number }[] {
  const words: { word: string; offset: number }[] = [];
  let offset = 0;

  for (const word of name.split(" ")) {
    words.push({ word, offset });
    offset += word.length + 1;
  }

  return words;
}

export function RotationListTable({ operatorId, rotations, pilotNames }: Props) {
  return (
    <Table theme={denseTableTheme}>
      <TableHead>
        <TableRow>
          <TableHeadCell>ID</TableHeadCell>
          <TableHeadCell>Legs</TableHeadCell>
          <TableHeadCell>Departure date</TableHeadCell>
          <TableHeadCell>Captain</TableHeadCell>
          <TableHeadCell>Status</TableHeadCell>
          <TableHeadCell>
            <span className="sr-only">Details</span>
          </TableHeadCell>
        </TableRow>
      </TableHead>
      <TableBody className="divide-y divide-gray-200 dark:divide-gray-800">
        {rotations.map((rotation) => {
          const detailsPath = `/operators/${operatorId}/rotations/${rotation.id}`;
          return (
            <LinkedTableRow key={rotation.id} to={detailsPath}>
              <TableCell className="whitespace-normal font-semibold text-gray-900 dark:text-white">
                <Link to={detailsPath} viewTransition className="hover:text-indigo-600 dark:hover:text-indigo-400">
                  {wordsOf(rotation.name).map(({ word, offset }) => (
                    <React.Fragment key={offset}>
                      {offset > 0 && " "}
                      <span className="whitespace-nowrap">{word}</span>
                    </React.Fragment>
                  ))}
                </Link>
              </TableCell>
              <TableCell>
                <span className="block text-xs text-gray-500 dark:text-gray-400">
                  {rotation.legs.length} {rotation.legs.length === 1 ? "leg" : "legs"}
                </span>
                {rotation.legs.length > 0 && (
                  <span className="block font-mono">
                    {rotation.legs.map((leg, index) => (
                      <React.Fragment key={leg.id}>
                        {index > 0 && <span className="text-gray-500 dark:text-gray-400">, </span>}
                        <Link
                          to={detailsPath}
                          viewTransition
                          className="font-semibold text-gray-900 hover:text-indigo-600 dark:hover:text-indigo-400 dark:text-white"
                        >
                          {leg.flightNumber}
                        </Link>
                      </React.Fragment>
                    ))}
                  </span>
                )}
              </TableCell>
              <TableCell className="font-mono text-gray-700 dark:text-gray-300">{departureDate(rotation)}</TableCell>
              <TableCell className="text-gray-700 dark:text-gray-300">{pilotNames[rotation.pilotId] ?? "—"}</TableCell>
              <TableCell>
                <RotationStatusBadge status={rotation.status} />
              </TableCell>
              <TableCell className="w-px">
                <Link
                  to={detailsPath}
                  viewTransition
                  aria-label={`${rotation.name} details`}
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
  );
}
