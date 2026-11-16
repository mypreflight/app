import { Alert, Modal, ModalBody, ModalHeader, Spinner } from "flowbite-react";
import React, { useEffect, useRef, useState } from "react";
import { HiInformationCircle } from "react-icons/hi";
import type { Airport } from "~/features/airport";
import { RunwayPickerMap } from "~/features/flight/components/Modal/RunwayPickerMap";
import { type Runway, surfaceTypeOptions } from "~/features/runway";
import type { Terminal } from "~/features/terminal";
import { useApi } from "~/shared/api/useApi";
import { formatDegrees } from "~/shared/lib/geo";
import { metresToFeet } from "~/shared/lib/units";
import { ModalActions } from "~/shared/ui/Modal/ModalActions";
import { ModalTitle } from "~/shared/ui/Modal/ModalTitle";

type Props = {
  airport: Airport;
  kind: "departure" | "arrival";
  currentSelectionId?: string | null;
  select: (runwayId: string) => void;
  cancel: () => void;
};

type AirportRunways =
  | { status: "loading" }
  | { status: "failed" }
  | { status: "ready"; runways: Runway[]; terminals: Terminal[] };

function byDesignator(left: Runway, right: Runway): number {
  return (
    Number.parseInt(left.designator, 10) - Number.parseInt(right.designator, 10) ||
    left.designator.localeCompare(right.designator)
  );
}

function surfaceLabel(runway: Runway): string {
  return surfaceTypeOptions.find((option) => option.value === runway.surfaceType)?.label ?? runway.surfaceType;
}

function useAirportRunways(airportId: string): AirportRunways {
  const { runwayService, terminalService } = useApi();
  const [state, setState] = useState<AirportRunways>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    Promise.all([
      runwayService.fetchAll(airportId) as Promise<Runway[]>,
      (terminalService.fetchAll(airportId) as Promise<Terminal[]>).catch((): Terminal[] => []),
    ]).then(
      ([runways, terminals]) => {
        if (!cancelled) {
          setState({ status: "ready", runways: [...runways].sort(byDesignator), terminals });
        }
      },
      () => {
        if (!cancelled) {
          setState({ status: "failed" });
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, [airportId, runwayService, terminalService]);

  return state;
}

export function SelectRunwayModal({ airport, kind, currentSelectionId = null, select, cancel }: Props) {
  const state = useAirportRunways(airport.id);
  const [selectedId, setSelectedId] = useState<string | null>(currentSelectionId);
  const ready = state.status === "ready" && state.runways.length > 0;

  return (
    <Modal size="6xl" className="text-gray-800 dark:text-white" show onClose={cancel}>
      <ModalHeader>
        <ModalTitle
          context={airport.city.name}
          action={kind === "departure" ? "Select departure runway" : "Select arrival runway"}
        />
      </ModalHeader>
      <ModalBody className="text-gray-900 dark:text-gray-100">
        {state.status === "loading" && (
          <div className="flex justify-center py-6">
            <Spinner color="indigo" />
          </div>
        )}
        {state.status === "failed" && (
          <Alert color="failure" icon={HiInformationCircle}>
            The runways could not be loaded. Close this window and try again.
          </Alert>
        )}
        {state.status === "ready" && state.runways.length === 0 && (
          <Alert color="warning" icon={HiInformationCircle}>
            No runways are configured for this airport.
          </Alert>
        )}
        {state.status === "ready" && state.runways.length > 0 && (
          <div className="grid gap-4 md:grid-cols-[20rem_minmax(0,1fr)]">
            <fieldset
              aria-label="Runways"
              className="flex min-w-0 flex-col gap-1.5 md:max-h-136 md:overflow-y-auto md:pe-1"
            >
              {state.runways.map((runway) => (
                <RunwayOption
                  key={runway.id}
                  runway={runway}
                  checked={selectedId === runway.id}
                  onSelect={() => setSelectedId(runway.id)}
                />
              ))}
            </fieldset>
            <RunwayPickerMap
              airport={airport}
              use={kind}
              runways={state.runways}
              terminals={state.terminals}
              selectedId={selectedId}
              onPick={setSelectedId}
            />
          </div>
        )}
      </ModalBody>
      <ModalActions
        cancel={{ onClick: cancel }}
        confirm={{
          label: "Set runway",
          onClick: () => selectedId && select(selectedId),
          disabled: !ready || selectedId === null,
        }}
      />
    </Modal>
  );
}

type RunwayOptionProps = {
  runway: Runway;
  checked: boolean;
  onSelect: () => void;
};

function RunwayOption({ runway, checked, onSelect }: RunwayOptionProps) {
  const row = useRef<HTMLLabelElement>(null);

  useEffect(() => {
    if (checked) {
      row.current?.scrollIntoView({ block: "nearest" });
    }
  }, [checked]);

  return (
    <label
      ref={row}
      className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 px-3 py-2 transition-colors hover:bg-gray-50 has-checked:border-indigo-300 has-checked:bg-indigo-50 has-focus-visible:ring-2 has-focus-visible:ring-indigo-500 dark:border-gray-800 dark:hover:bg-gray-800 dark:has-checked:border-indigo-700 dark:has-checked:bg-indigo-950"
    >
      <input type="radio" name="runway" value={runway.id} checked={checked} onChange={onSelect} className="sr-only" />
      <span className="w-16 shrink-0 font-mono text-2xl font-bold text-gray-900 dark:text-white">
        {runway.designator}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="whitespace-nowrap font-mono text-sm text-gray-700 dark:text-gray-200">
          {runway.length.toLocaleString()}
          <RowUnit unit="m" /> × {runway.width}
          <RowUnit unit="m" />
          {runway.elevation !== null && (
            <>
              {" @ "}
              {metresToFeet(runway.elevation).toLocaleString()}
              <RowUnit unit="ft" />
            </>
          )}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {surfaceLabel(runway)}, CRS <span className="font-mono">{formatDegrees(runway.magneticHeading)}</span>
        </span>
      </span>
    </label>
  );
}

function RowUnit({ unit }: { unit: string }) {
  return <span className="ms-0.5 font-sans text-xs text-gray-500 dark:text-gray-400">{unit}</span>;
}
