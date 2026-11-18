import type { SimbriefAircraft, SimbriefFlight } from "~/features/user";
import { FormattedIcaoDate } from "~/shared/ui/Date/FormattedIcaoDate";
import { FormattedIcaoTime } from "~/shared/ui/Date/FormattedIcaoTime";
import { MetaRow } from "~/shared/ui/Display/MetaRow";

type Props = {
  plan: SimbriefFlight;
  className?: string;
};

function describeAircraft({ name, type, registration }: SimbriefAircraft): string | null {
  const model = name ?? type;

  if (model === null) {
    return registration;
  }

  return registration === null ? model : `${model} · ${registration}`;
}

function toDate(value: string | null): Date | null {
  return value === null ? null : new Date(value);
}

export function SimbriefPlanSummary({ plan, className = "" }: Props) {
  const { origin, destination, callsign, aircraft, scheduledOffBlockTime, generatedAt } = plan;
  const aircraftLabel = describeAircraft(aircraft);
  const departure = toDate(scheduledOffBlockTime);
  const generated = toDate(generatedAt);

  return (
    <div className={`space-y-1.5 text-sm ${className}`}>
      <MetaRow label="Latest plan" value={<span className="font-mono">{callsign}</span>} />
      <MetaRow
        label="Route"
        value={
          <span className="font-mono">
            {origin.icaoCode} → {destination.icaoCode}
          </span>
        }
      />
      {departure !== null && (
        <MetaRow
          label="Departure"
          value={
            <>
              <FormattedIcaoDate date={departure} /> <FormattedIcaoTime date={departure} />
            </>
          }
        />
      )}
      {aircraftLabel !== null && <MetaRow label="Aircraft" value={aircraftLabel} />}
      {generated !== null && (
        <MetaRow
          label="Generated"
          value={
            <>
              <FormattedIcaoDate date={generated} /> <FormattedIcaoTime date={generated} />
            </>
          }
        />
      )}
    </div>
  );
}
