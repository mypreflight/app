import { Badge, Button } from "flowbite-react";
import React, { type ReactNode } from "react";
import { gateLocationOptions, NoiseSensitivity, type ParkingPosition } from "~/features/parking-position";
import { standFactGroups } from "~/features/parking-position/lib/standFacts";
import { standName } from "~/features/parking-position/lib/standName";
import { LightingType, lightingTypeOptions, type Runway, SurfaceType, surfaceTypeOptions } from "~/features/runway";
import type { Terminal } from "~/features/terminal";
import { formatPositionDdm } from "~/shared/lib/formatGeo";
import { formatDegrees } from "~/shared/lib/geo";
import { metresToFeet } from "~/shared/lib/units";
import { PanelSection } from "~/shared/ui/Layout/PanelSection";

const SECTION_SPACING = "py-3 first:pt-0 last:pb-0";
const STAT_STRIP = "mt-1 flex flex-wrap gap-x-6 gap-y-3";

function labelOf(options: { value: string; label: string }[], value: string): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

type Loadable<T> = { loading: true } | { loading: false; value: T | null };

type AssignableSectionProps<T> = {
  assigned: Loadable<T>;
  action: ReactNode;
  lock: string | null;
};

type StandSectionProps = {
  stand: Loadable<ParkingPosition>;
  terminal: Terminal | null;
  action: ReactNode;
  lock: string | null;
};

export function StandSection({ stand, terminal, action, lock }: StandSectionProps) {
  return (
    <PanelSection className={SECTION_SPACING} title="Parking stand" aside={stand.loading ? null : action}>
      {stand.loading ? (
        <LoadingValue />
      ) : stand.value === null ? (
        <PendingValue note={lock} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {terminal !== null && <TerminalHalf terminal={terminal} />}
            <StandHalf stand={stand.value} wide={terminal === null} />
          </div>
          <StandDetails stand={stand.value} />
        </>
      )}
    </PanelSection>
  );
}

function TerminalHalf({ terminal }: { terminal: Terminal }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Designator code={terminal.shortName}>{terminal.fullName}</Designator>
      {terminal.operatorCodes.length > 0 && (
        <dl className="mt-1">
          <Stat label="Operators">
            <span className="flex flex-wrap gap-x-2 font-mono text-sm">
              {terminal.operatorCodes.map((code) => (
                <span key={code}>{code}</span>
              ))}
            </span>
          </Stat>
        </dl>
      )}
      {terminal.text && <p className="text-xs text-gray-500 dark:text-gray-400">{terminal.text}</p>}
    </div>
  );
}

function standLines(stand: ParkingPosition): { handling: string[]; services: string[] } {
  const groups = new Map(standFactGroups(stand).map((group) => [group.label, group.facts]));
  const available = (label: string) => (groups.get(label) ?? []).filter((fact) => fact.available);
  const [position, , guidance] = groups.get("Handling") ?? [];

  return {
    handling: [...available("Boarding"), guidance, position]
      .filter((fact) => fact?.available)
      .map((fact) => fact?.text ?? ""),
    services: available("Services").map((fact) => fact.text),
  };
}

function FactLine({ facts, className }: { facts: string[]; className: string }) {
  return (
    <p className={className}>
      {facts.map((fact, index) => (
        <React.Fragment key={fact}>
          {index > 0 && " · "}
          <span className="whitespace-nowrap">{fact}</span>
        </React.Fragment>
      ))}
    </p>
  );
}

function StandHalf({ stand, wide }: { stand: ParkingPosition; wide: boolean }) {
  const { handling } = standLines(stand);

  return (
    <div className={wide ? "col-span-2 flex min-w-0 flex-col gap-1.5" : "flex min-w-0 flex-col gap-1.5"}>
      <Designator code={standName(stand.name)}>{labelOf(gateLocationOptions, stand.location)}</Designator>
      {handling.length > 0 && <FactLine facts={handling} className="text-sm text-gray-800 dark:text-gray-100" />}
    </div>
  );
}

function StandDetails({ stand }: { stand: ParkingPosition }) {
  const { services } = standLines(stand);
  const noiseWindow =
    stand.noiseSensitivityStartTime && stand.noiseSensitivityEndTime
      ? `${stand.noiseSensitivityStartTime}–${stand.noiseSensitivityEndTime} UTC`
      : null;
  const position = stand.coordinates
    ? formatPositionDdm(stand.coordinates.latitude, stand.coordinates.longitude)
    : null;

  return (
    <div className="mt-1 flex min-w-0 flex-col gap-1.5">
      {services.length > 0 && <FactLine facts={services} className="text-xs text-gray-500 dark:text-gray-400" />}
      {stand.deicingDescription && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{stand.deicingDescription}</p>
      )}
      {stand.noiseSensitivity === NoiseSensitivity.Yes && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          <Badge color="yellow">Noise sensitive</Badge>
          {noiseWindow && <span className="font-mono text-gray-700 dark:text-gray-300">{noiseWindow}</span>}
          {stand.noiseSensitivityText && (
            <span className="text-gray-500 dark:text-gray-400">{stand.noiseSensitivityText}</span>
          )}
        </div>
      )}
      {position !== null && (
        <dl className="mt-1">
          <Stat label="Position">
            <span className="flex flex-wrap gap-x-3 font-mono text-sm">
              <span>{position[0]}</span>
              <span>{position[1]}</span>
            </span>
          </Stat>
        </dl>
      )}
    </div>
  );
}

export function RunwaySection({ title, assigned, action, lock }: AssignableSectionProps<Runway> & { title: string }) {
  return (
    <PanelSection className={SECTION_SPACING} title={title} aside={assigned.loading ? null : action}>
      {assigned.loading ? (
        <LoadingValue />
      ) : assigned.value === null ? (
        <PendingValue note={lock} />
      ) : (
        <RunwayDetails runway={assigned.value} />
      )}
    </PanelSection>
  );
}

function runwayCaption(runway: Runway): string {
  const surface =
    runway.surfaceType === SurfaceType.Unknown ? "Surface unknown" : labelOf(surfaceTypeOptions, runway.surfaceType);
  const lighting =
    runway.lightingType === LightingType.Unknown
      ? "lighting unknown"
      : labelOf(lightingTypeOptions, runway.lightingType).split(" — ")[0];

  return `${surface} · ${lighting}`;
}

function RunwayDetails({ runway }: { runway: Runway }) {
  const displaced = runway.displace ?? 0;

  return (
    <>
      <Designator code={runway.designator}>{runwayCaption(runway)}</Designator>
      <dl className={STAT_STRIP}>
        <Stat label="Heading">
          <Figure value={formatDegrees(runway.magneticHeading)} unit="M" />
        </Stat>
        <Stat
          label="Length"
          note={
            displaced > 0 ? (
              <>
                <span className="font-mono">{displaced}</span> m displaced
              </>
            ) : null
          }
        >
          <Figure value={runway.length.toLocaleString()} unit="m" />
        </Stat>
        <Stat label="Width">
          <Figure value={runway.width} unit="m" />
        </Stat>
        {runway.elevation !== null && (
          <Stat label="Elevation">
            <Figure value={metresToFeet(runway.elevation).toLocaleString()} unit="ft" />
          </Stat>
        )}
      </dl>
    </>
  );
}

type AssignButtonProps = {
  assigned: boolean;
  subject: string;
  onClick: () => void;
};

export function AssignButton({ assigned, subject, onClick }: AssignButtonProps) {
  const verb = assigned ? "Change" : "Set";

  return (
    <Button color="alternative" size="xs" onClick={onClick} aria-label={`${verb} ${subject}`}>
      {verb}
    </Button>
  );
}

function Designator({ code, children }: { code: string; children?: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-wrap items-baseline gap-x-2.5">
      <span className="font-mono text-3xl font-bold leading-9 text-gray-900 dark:text-white">{code}</span>
      {children && <span className="min-w-0 text-sm text-gray-500 dark:text-gray-400">{children}</span>}
    </div>
  );
}

function Figure({ value, unit }: { value: string | number; unit: string }) {
  return (
    <span className="whitespace-nowrap">
      <span className="font-mono tabular-nums text-gray-900 dark:text-gray-100">{value}</span>
      <span className="ms-0.5 text-xs font-normal text-gray-500 dark:text-gray-400">{unit}</span>
    </span>
  );
}

function Stat({ label, note = null, children }: { label: string; note?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col">
      <dt className="text-xs text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className="order-first text-lg font-bold leading-7 text-gray-900 dark:text-gray-100">{children}</dd>
      {note !== null && <dd className="text-xs text-gray-500 dark:text-gray-400">{note}</dd>}
    </div>
  );
}

function PendingValue({ note }: { note: string | null }) {
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden={true}
        className="block h-9 w-16 shrink-0 rounded-md border border-dashed border-gray-300 dark:border-gray-600"
      />
      <span className="flex min-w-0 flex-col">
        <span className="text-base font-medium leading-6 text-gray-700 dark:text-gray-200">Not assigned</span>
        {note !== null && <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{note}</span>}
      </span>
    </div>
  );
}

function LoadingValue() {
  return (
    <span
      aria-hidden={true}
      className="block h-9 w-16 animate-pulse rounded-md bg-gray-100 motion-reduce:animate-none dark:bg-gray-800"
    />
  );
}
