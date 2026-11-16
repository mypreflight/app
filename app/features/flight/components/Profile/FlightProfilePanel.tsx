import { Tooltip } from "flowbite-react";
import React, { type ReactNode, useMemo, useState } from "react";
import { HiInformationCircle } from "react-icons/hi";
import { LuUnfoldHorizontal, LuZoomIn, LuZoomOut } from "react-icons/lu";
import type { FlightPathElement, Timesheet } from "~/features/flight";
import { VerticalProfile } from "~/features/flight/components/Profile/VerticalProfile";
import {
  type PlannedPoint,
  type ProfileWindow,
  profileDomain,
  profileSamples,
  profileWindow,
  zoomProfile,
} from "~/features/flight/lib/verticalProfile";
import { FieldLabel } from "~/shared/ui/Display/FieldLabel";

const BUTTON_ZOOM_FACTOR = 2;

type Props = {
  controls: ReactNode;
  readout: ReactNode;
  actions?: ReactNode;
  path: FlightPathElement[];
  timesheet: Timesheet;
  planned: PlannedPoint[];
  cursorIndex: number | null;
  onCursorChange: (index: number | null) => void;
  notice?: string | null;
};

function ProfileNotice({ children }: { children: string }) {
  return (
    <p className="mt-2 flex items-center gap-2 rounded-xl border border-dashed border-gray-300 px-3 py-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
      <HiInformationCircle className="size-4 shrink-0" aria-hidden={true} />
      {children}
    </p>
  );
}

function Legend({ hasPlan }: { hasPlan: boolean }) {
  return (
    <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600 dark:text-gray-300">
      <span className="flex items-center gap-1.5">
        <span aria-hidden={true} className="h-0.5 w-3.5 rounded-full bg-indigo-500 dark:bg-indigo-400" />
        Altitude
      </span>
      <span className="flex items-center gap-1.5">
        <span aria-hidden={true} className="h-0.5 w-3.5 rounded-full bg-gray-500 dark:bg-gray-400" />
        Ground speed
      </span>
      {hasPlan && (
        <span className="flex items-center gap-1.5">
          <span
            aria-hidden={true}
            className="w-3.5 border-t-2 border-dashed border-indigo-400 dark:border-indigo-300"
          />
          Planned altitude
        </span>
      )}
    </span>
  );
}

function span(window: ProfileWindow): number {
  return window.end - window.start;
}

const SEGMENT =
  "flex h-8 w-8 items-center justify-center text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent pointer-coarse:size-11 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white dark:focus-visible:ring-indigo-400 dark:disabled:text-gray-600";

type ZoomButtonProps = {
  label: string;
  icon: ReactNode;
  disabled: boolean;
  onClick: () => void;
};

function ZoomButton({ label, icon, disabled, onClick }: ZoomButtonProps) {
  return (
    <Tooltip content={label} style="auto">
      <button type="button" aria-label={label} disabled={disabled} onClick={onClick} className={SEGMENT}>
        {icon}
      </button>
    </Tooltip>
  );
}

type ZoomControlsProps = {
  domain: ProfileWindow;
  view: ProfileWindow | null;
  onViewChange: (view: ProfileWindow | null) => void;
};

function ZoomControls({ domain, view, onViewChange }: ZoomControlsProps) {
  const zoomedIn = zoomProfile(domain, view, 1 / BUTTON_ZOOM_FACTOR);
  const canZoomIn = zoomedIn !== null && span(zoomedIn) < span(profileWindow(domain, view));

  return (
    <fieldset
      aria-label="Profile zoom"
      className="flex divide-x divide-gray-200 overflow-hidden rounded-lg border border-gray-200 bg-white dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800"
    >
      <ZoomButton
        label="Zoom out"
        icon={<LuZoomOut aria-hidden={true} />}
        disabled={view === null}
        onClick={() => onViewChange(zoomProfile(domain, view, BUTTON_ZOOM_FACTOR))}
      />
      <ZoomButton
        label="Zoom in"
        icon={<LuZoomIn aria-hidden={true} />}
        disabled={!canZoomIn}
        onClick={() => onViewChange(zoomedIn)}
      />
      <ZoomButton
        label="Show the whole flight"
        icon={<LuUnfoldHorizontal aria-hidden={true} />}
        disabled={view === null}
        onClick={() => onViewChange(null)}
      />
    </fieldset>
  );
}

export function FlightProfilePanel({
  controls,
  readout,
  actions,
  path,
  timesheet,
  planned,
  cursorIndex,
  onCursorChange,
  notice = null,
}: Props) {
  const [view, setView] = useState<ProfileWindow | null>(null);
  const domain = useMemo(() => profileDomain(profileSamples(path), timesheet, planned), [path, timesheet, planned]);

  return (
    <section
      aria-label="Vertical profile"
      className="rounded-2xl border border-gray-200 bg-white px-3 pt-2.5 pb-2 md:pointer-events-auto dark:border-gray-700 dark:bg-gray-900"
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {controls}
        <div className="flex flex-col gap-0.5">
          <FieldLabel>Vertical profile</FieldLabel>
          <Legend hasPlan={planned.length > 0} />
        </div>
        <div className="ms-auto flex flex-wrap items-center justify-end gap-x-3 gap-y-2">
          <div className="flex justify-end md:min-w-100">{readout}</div>
          {notice === null && <ZoomControls domain={domain} view={view} onViewChange={setView} />}
          {actions}
        </div>
      </div>
      {notice === null ? (
        <VerticalProfile
          path={path}
          timesheet={timesheet}
          planned={planned}
          cursorIndex={cursorIndex}
          onCursorChange={onCursorChange}
          view={view}
          onViewChange={setView}
          className="mt-2"
        />
      ) : (
        <ProfileNotice>{notice}</ProfileNotice>
      )}
    </section>
  );
}
