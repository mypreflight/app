import React, { useMemo } from "react";
import type { FlightPathElement } from "~/features/flight";
import { LiveTelemetry } from "~/features/flight/components/Map/Box/Overlay/LiveTelemetry";
import { profileExtremes, profileSamples } from "~/features/flight/lib/verticalProfile";
import { dateToIcaoTime } from "~/shared/ui/Date/FormattedIcaoTime";

type Props = {
  path: FlightPathElement[];
  point: FlightPathElement | null;
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex items-baseline gap-1 whitespace-nowrap">
      <span className="text-2xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</span>
      <span className="font-mono text-xs font-semibold tabular-nums text-gray-800 dark:text-gray-100">{value}</span>
    </span>
  );
}

export function ProfileReadout({ path, point }: Props) {
  const extremes = useMemo(() => profileExtremes(profileSamples(path)), [path]);

  if (point !== null) {
    return (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-mono text-xs font-bold tabular-nums text-gray-900 dark:text-white">
          {dateToIcaoTime(new Date(point.date))}Z
        </span>
        <LiveTelemetry point={point} />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      {extremes.altitude !== null && (
        <Stat label="Max ALT" value={`${Math.round(extremes.altitude).toLocaleString("en-US")} ft`} />
      )}
      {extremes.groundSpeed !== null && <Stat label="Max GS" value={`${Math.round(extremes.groundSpeed)} kt`} />}
    </div>
  );
}
