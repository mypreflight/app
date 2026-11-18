import { Badge } from "flowbite-react";
import React from "react";
import type { Aircraft } from "~/features/aircraft/model";

type Props = {
  aircraft: Aircraft;
  className?: string;
};

export function UnconfirmedAircraftBadge({ aircraft, className = "" }: Props) {
  if (aircraft.isConfirmed) {
    return null;
  }

  return (
    <Badge color="warning" size="sm" className={`w-fit ${className}`}>
      Unconfirmed
    </Badge>
  );
}
