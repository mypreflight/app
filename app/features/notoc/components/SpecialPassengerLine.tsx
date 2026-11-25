import { Badge } from "flowbite-react";
import React from "react";
import type { SpecialPassengerGroup } from "~/features/notoc/lib/specialPassengerGroups";
import { toHuman } from "~/i18n/translate";

type Props = {
  group: SpecialPassengerGroup;
};

export function SpecialPassengerLine({ group }: Props) {
  return (
    <li className="flex items-start gap-3 py-2.5">
      <span className="w-12 shrink-0">
        <Badge color="gray" size="xs" className="w-fit px-1.5 py-0 font-mono text-xs">
          {group.ssr}
        </Badge>
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          {toHuman.flight.specialServiceRequest(group.ssr)}
        </p>
        <p className="font-mono text-xs text-gray-700 dark:text-gray-300">{group.seats.join(" ")}</p>
        {group.remarks.length > 0 && (
          <ul className="font-mono text-xs text-gray-600 dark:text-gray-400">
            {group.remarks.map((remark) => (
              <li key={remark}>{remark}</li>
            ))}
          </ul>
        )}
      </div>

      <span className="shrink-0 font-mono text-sm font-bold tabular-nums text-gray-900 dark:text-white">
        {group.seats.length}
      </span>
    </li>
  );
}
