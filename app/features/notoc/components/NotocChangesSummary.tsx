import React from "react";
import { designatorOf } from "~/features/cargo-hold/lib/designator";
import type { LoadingPosition } from "~/features/cargo-hold/model";
import type { NotocChanges, NotocReposition } from "~/features/notoc/model";
import { FieldLabel } from "~/shared/ui/Display/FieldLabel";

type Props = {
  changes: NotocChanges;
};

function weightChange(kg: number): string {
  const rounded = Math.abs(kg).toLocaleString();
  return kg > 0 ? `up ${rounded} kg` : `down ${rounded} kg`;
}

function waybills(label: string, list: string[]): React.ReactNode {
  if (list.length === 0) {
    return null;
  }

  return (
    <li className="text-sm text-gray-700 dark:text-gray-200">
      {label}: <span className="font-mono">{list.join(", ")}</span>
    </li>
  );
}

function placed(position: LoadingPosition | null): string {
  return position === null ? "loose" : designatorOf(position);
}

function repositionOf({ awb, fromPosition, toPosition }: NotocReposition): string {
  return `${awb} ${placed(fromPosition)} → ${placed(toPosition)}`;
}

export function NotocChangesSummary({ changes }: Props) {
  if (!changes.changed) {
    return (
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Nothing changed between the preliminary notification and this one.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <FieldLabel>Since the preliminary notification</FieldLabel>
      <ul className="flex flex-col gap-1">
        {waybills("Dangerous goods added", changes.dangerousGoodsAdded)}
        {waybills("Dangerous goods removed", changes.dangerousGoodsRemoved)}
        {waybills("Special loads added", changes.specialLoadsAdded)}
        {waybills("Special loads removed", changes.specialLoadsRemoved)}
        {waybills("Repositioned", changes.repositioned.map(repositionOf))}
        {changes.cargoChangeKg !== 0 && (
          <li className="text-sm text-gray-700 dark:text-gray-200">Cargo {weightChange(changes.cargoChangeKg)}</li>
        )}
        {changes.deadloadChangeKg !== 0 && (
          <li className="text-sm text-gray-700 dark:text-gray-200">
            Deadload {weightChange(changes.deadloadChangeKg)}
          </li>
        )}
      </ul>
    </div>
  );
}
