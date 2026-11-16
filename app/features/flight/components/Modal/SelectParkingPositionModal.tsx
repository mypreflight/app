import { Alert, Modal, ModalBody, ModalHeader, Spinner } from "flowbite-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { HiInformationCircle } from "react-icons/hi";
import type { Airport } from "~/features/airport";
import { StandPickerMap } from "~/features/flight/components/Modal/StandPickerMap";
import { gateLocationOptions, NoiseSensitivity, type ParkingPosition } from "~/features/parking-position";
import {
  groupParkingPositionsByTerminal,
  type TerminalParkingPositionGroup,
} from "~/features/parking-position/lib/parkingPositionGroups";
import { standFactGroups } from "~/features/parking-position/lib/standFacts";
import { standName } from "~/features/parking-position/lib/standName";
import type { Runway } from "~/features/runway";
import type { Terminal } from "~/features/terminal";
import { useApi } from "~/shared/api/useApi";
import { FilterInput } from "~/shared/ui/Filter/FilterInput";
import { ModalActions } from "~/shared/ui/Modal/ModalActions";
import { ModalTitle } from "~/shared/ui/Modal/ModalTitle";

type Props = {
  airport: Airport;
  currentSelectionId?: string | null;
  select: (parkingPositionId: string) => void;
  cancel: () => void;
};

type AirportStands =
  | { status: "loading" }
  | { status: "failed" }
  | { status: "ready"; parkingPositions: ParkingPosition[]; terminals: Terminal[]; runways: Runway[] };

function locationLabel(parkingPosition: ParkingPosition): string {
  return gateLocationOptions.find((option) => option.value === parkingPosition.location)?.label ?? "";
}

function compact(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "");
}

function matches(group: TerminalParkingPositionGroup, parkingPosition: ParkingPosition, query: string): boolean {
  const needle = compact(query);
  if (needle === "") {
    return true;
  }

  return [
    parkingPosition.name,
    group.terminal?.shortName ?? "",
    group.terminal?.fullName ?? "",
    locationLabel(parkingPosition),
  ].some((field) => compact(field).includes(needle));
}

function useAirportStands(airportId: string): AirportStands {
  const { parkingPositionService, terminalService, runwayService } = useApi();
  const [state, setState] = useState<AirportStands>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    Promise.all([
      parkingPositionService.fetchAll(airportId) as Promise<ParkingPosition[]>,
      terminalService.fetchAll(airportId) as Promise<Terminal[]>,
      (runwayService.fetchAll(airportId) as Promise<Runway[]>).catch((): Runway[] => []),
    ]).then(
      ([parkingPositions, terminals, runways]) => {
        if (!cancelled) {
          setState({ status: "ready", parkingPositions, terminals, runways });
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
  }, [airportId, parkingPositionService, terminalService, runwayService]);

  return state;
}

export function SelectParkingPositionModal({ airport, currentSelectionId = null, select, cancel }: Props) {
  const state = useAirportStands(airport.id);
  const [selectedId, setSelectedId] = useState<string | null>(currentSelectionId);
  const [focusId, setFocusId] = useState<string | null>(currentSelectionId);
  const [query, setQuery] = useState("");
  const ready = state.status === "ready" && state.parkingPositions.length > 0;

  const groups = useMemo(
    () =>
      state.status === "ready"
        ? groupParkingPositionsByTerminal(state.parkingPositions, state.terminals)
            .map((group) => ({
              ...group,
              parkingPositions: group.parkingPositions.filter((parkingPosition) =>
                matches(group, parkingPosition, query),
              ),
            }))
            .filter((group) => group.parkingPositions.length > 0)
        : [],
    [state, query],
  );

  const chooseFromList = (parkingPosition: ParkingPosition) => {
    setSelectedId(parkingPosition.id);
    if (parkingPosition.coordinates) {
      setFocusId(parkingPosition.id);
    }
  };

  return (
    <Modal size="6xl" className="text-gray-800 dark:text-white" show onClose={cancel}>
      <ModalHeader>
        <ModalTitle context={airport.city.name} action="Select parking stand" />
      </ModalHeader>
      <ModalBody className="text-gray-900 dark:text-gray-100">
        {state.status === "loading" && (
          <div className="flex justify-center py-6">
            <Spinner color="indigo" />
          </div>
        )}
        {state.status === "failed" && (
          <Alert color="failure" icon={HiInformationCircle}>
            The parking stands could not be loaded. Close this window and try again.
          </Alert>
        )}
        {state.status === "ready" && state.parkingPositions.length === 0 && (
          <Alert color="warning" icon={HiInformationCircle}>
            No parking stands are configured for this airport.
          </Alert>
        )}
        {state.status === "ready" && state.parkingPositions.length > 0 && (
          <div className="grid gap-x-4 gap-y-3 md:grid-cols-[20rem_minmax(0,1fr)] md:grid-rows-[auto_minmax(0,1fr)]">
            <FilterInput
              value={query}
              onChange={setQuery}
              placeholder="Search by name, terminal or type"
              className="md:col-start-1 md:row-start-1"
            />
            <StandPickerMap
              airport={airport}
              parkingPositions={state.parkingPositions}
              runways={state.runways}
              terminals={state.terminals}
              selectedId={selectedId}
              focusId={focusId}
              hiddenOnPhone={query.trim() !== ""}
              onPick={setSelectedId}
            />
            <div className="flex min-h-0 flex-col gap-4 overflow-y-auto md:col-start-1 md:row-start-2 md:max-h-122 md:pe-1">
              {groups.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No parking stand matches “{query}”.</p>
              ) : (
                groups.map((group) => (
                  <fieldset key={group.terminal?.id ?? "unassigned"} className="flex min-w-0 flex-col gap-1.5">
                    <legend className="mb-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {group.terminal?.fullName ?? "Unassigned"}
                    </legend>
                    {group.parkingPositions.map((parkingPosition) => (
                      <StandOption
                        key={parkingPosition.id}
                        parkingPosition={parkingPosition}
                        checked={selectedId === parkingPosition.id}
                        onSelect={() => chooseFromList(parkingPosition)}
                      />
                    ))}
                  </fieldset>
                ))
              )}
            </div>
          </div>
        )}
      </ModalBody>
      <ModalActions
        cancel={{ onClick: cancel }}
        confirm={{
          label: "Set parking stand",
          onClick: () => selectedId && select(selectedId),
          disabled: !ready || selectedId === null,
        }}
      />
    </Modal>
  );
}

function boardingSummary(parkingPosition: ParkingPosition): string {
  const boarding = standFactGroups(parkingPosition).find((group) => group.label === "Boarding");
  const available = boarding?.facts.find((fact) => fact.available) ?? boarding?.facts[0];

  return [locationLabel(parkingPosition), available?.text].filter(Boolean).join(" · ");
}

function guidanceSummary(parkingPosition: ParkingPosition): string {
  const handling = standFactGroups(parkingPosition).find((group) => group.label === "Handling");
  const guidance = handling?.facts.at(-1)?.text;
  const noise = parkingPosition.noiseSensitivity === NoiseSensitivity.Yes ? "Noise sensitive" : null;
  const offMap = parkingPosition.coordinates ? null : "Not on map";

  return [guidance, noise, offMap].filter(Boolean).join(" · ");
}

type StandOptionProps = {
  parkingPosition: ParkingPosition;
  checked: boolean;
  onSelect: () => void;
};

function StandOption({ parkingPosition, checked, onSelect }: StandOptionProps) {
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
      <input
        type="radio"
        name="parkingPosition"
        value={parkingPosition.id}
        checked={checked}
        onChange={onSelect}
        className="sr-only"
      />
      <span className="w-16 shrink-0 font-mono text-2xl font-bold text-gray-900 dark:text-white">
        {standName(parkingPosition.name)}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm text-gray-700 dark:text-gray-200">{boardingSummary(parkingPosition)}</span>
        <span className="truncate text-xs text-gray-500 dark:text-gray-400">{guidanceSummary(parkingPosition)}</span>
      </span>
    </label>
  );
}
