import { Alert, Modal, ModalBody, ModalHeader, Spinner } from "flowbite-react";
import React, { useEffect, useRef, useState } from "react";
import { HiInformationCircle } from "react-icons/hi";
import { useAuth } from "~/app-state/useAuth";
import { type Airport, type AirportWeatherReport, type AtisSource, resolveWeatherSource } from "~/features/airport";
import { AtisSourceLabel } from "~/features/airport/components/Library/AtisSourceLabel";
import { AtisSourceSwitch } from "~/features/airport/components/Library/AtisSourceSwitch";
import { type AirportWeather, useAirportWeather } from "~/features/airport/hooks/useAirportWeather";
import { type AtisChoice, useAtisChoice } from "~/features/airport/hooks/useAtisChoice";
import { translateWeatherSource } from "~/features/airport/i18n";
import { type AtisEnd, atisLetter, runwayUse } from "~/features/airport/lib/atis";
import { metarWind, type Wind, windComponents } from "~/features/airport/lib/wind";
import { RunwayPickerMap } from "~/features/flight/components/Modal/RunwayPickerMap";
import { type Runway, surfaceTypeOptions } from "~/features/runway";
import { AtisUseChip, WindChip } from "~/features/runway/components/RunwayChips";
import type { Terminal } from "~/features/terminal";
import { useApi } from "~/shared/api/useApi";
import { formatDegrees } from "~/shared/lib/geo";
import { dateToZuluStamp } from "~/shared/ui/Date/zuluStamp";
import { ModalActions } from "~/shared/ui/Modal/ModalActions";
import { ModalTitle } from "~/shared/ui/Modal/ModalTitle";

type Props = {
  airport: Airport;
  kind: AtisEnd;
  weather?: AirportWeather;
  atisSource?: AtisSource | null;
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

export function SelectRunwayModal({
  airport,
  kind,
  weather: givenWeather,
  atisSource = null,
  currentSelectionId = null,
  select,
  cancel,
}: Props) {
  const { user } = useAuth();
  const state = useAirportRunways(airport.id);
  const fetchedWeather = useAirportWeather(givenWeather === undefined ? airport.id : null);
  const weather = givenWeather ?? fetchedWeather;
  const atis = useAtisChoice(weather, kind, atisSource);
  const [selectedId, setSelectedId] = useState<string | null>(currentSelectionId);
  const ready = state.status === "ready" && state.runways.length > 0;
  const report = atis.reports[0] ?? null;
  const letter = report === null ? null : atisLetter(report.content);
  const wind =
    weather.status === "ready" ? metarWind(weather.reports, resolveWeatherSource(user?.defaultWeatherSource)) : null;

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
          <div className="flex flex-col gap-4">
            <AtisAndWind weather={weather} atis={atis} report={report} wind={wind} />
            <div className="grid gap-4 md:grid-cols-[27rem_minmax(0,1fr)]">
              <fieldset
                aria-label="Runways"
                className="flex min-w-0 flex-col gap-1.5 md:max-h-136 md:overflow-y-auto md:pe-1"
              >
                {state.runways.map((runway) => (
                  <RunwayOption
                    key={runway.id}
                    runway={runway}
                    report={report}
                    letter={letter}
                    wind={wind}
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

type AtisAndWindProps = {
  weather: AirportWeather;
  atis: AtisChoice;
  report: AirportWeatherReport | null;
  wind: Wind | null;
};

function windReading(wind: Wind): string {
  if (wind.speed === 0) {
    return "Calm";
  }

  const direction = wind.direction === null ? "VRB" : String(wind.direction).padStart(3, "0");

  return `${direction}/${String(wind.speed).padStart(2, "0")}`;
}

function AtisAndWind({ weather, atis, report, wind }: AtisAndWindProps) {
  if (weather.status === "loading") {
    return null;
  }

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
      <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">ATIS</span>
      {weather.status === "failed" || atis.source === null || report === null ? (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {weather.status === "failed" ? "Could not be loaded" : "None for this airport"}
        </span>
      ) : (
        <>
          {atis.sources.length > 1 ? (
            <AtisSourceSwitch sources={atis.sources} selected={atis.source} onSelect={atis.select} />
          ) : (
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              <AtisSourceLabel source={atis.source} />
            </span>
          )}
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {translateWeatherSource(report.source)}{" "}
            <span className="font-mono text-gray-700 dark:text-gray-300">
              {dateToZuluStamp(new Date(report.publishedAt ?? report.lastFetched))}
            </span>
          </span>
        </>
      )}
      {wind !== null && (
        <span className="ms-auto text-xs text-gray-500 dark:text-gray-400">
          Wind <span className="font-mono text-gray-700 dark:text-gray-300">{windReading(wind)}</span>
        </span>
      )}
    </div>
  );
}

type RunwayOptionProps = {
  runway: Runway;
  report: AirportWeatherReport | null;
  letter: string | null;
  wind: Wind | null;
  checked: boolean;
  onSelect: () => void;
};

function RunwayOption({ runway, report, letter, wind, checked, onSelect }: RunwayOptionProps) {
  const row = useRef<HTMLLabelElement>(null);

  useEffect(() => {
    if (checked) {
      row.current?.scrollIntoView({ block: "nearest" });
    }
  }, [checked]);

  return (
    <label
      ref={row}
      className="group flex min-h-14 shrink-0 cursor-pointer items-stretch rounded-lg border border-gray-200 transition-colors hover:bg-gray-50 has-checked:border-indigo-300 has-checked:bg-indigo-50 has-focus-visible:ring-2 has-focus-visible:ring-indigo-500 dark:border-gray-800 dark:hover:bg-gray-800 dark:has-checked:border-indigo-700 dark:has-checked:bg-indigo-950"
    >
      <input type="radio" name="runway" value={runway.id} checked={checked} onChange={onSelect} className="sr-only" />
      <span className="flex w-18 shrink-0 items-center px-3 py-2 font-mono text-2xl font-bold leading-7 text-gray-900 dark:text-white">
        {runway.designator}
      </span>
      <span
        aria-hidden={true}
        className="w-px shrink-0 bg-gray-200 group-has-checked:bg-indigo-300 dark:bg-gray-800 dark:group-has-checked:bg-indigo-700"
      />
      <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1.5 px-3 py-2">
        <span className="flex shrink-0 gap-1.5">
          <span className="flex w-16 justify-center">
            <AtisUseChip letter={letter} use={runwayUse(report, runway.id)} />
          </span>
          <span className="flex min-w-20 justify-center">
            {wind !== null && (
              <WindChip wind={wind} components={windComponents(wind, runway.trueHeading ?? runway.magneticHeading)} />
            )}
          </span>
        </span>
        <span className="flex min-w-32 flex-1 flex-col">
          <span className="font-mono text-sm text-gray-700 dark:text-gray-200">
            {runway.length.toLocaleString()} × {runway.width}
            <span className="ms-0.5 font-sans text-xs text-gray-500 dark:text-gray-400">m</span>
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {surfaceLabel(runway)}, CRS <span className="font-mono">{formatDegrees(runway.magneticHeading)}</span>
          </span>
        </span>
      </span>
    </label>
  );
}
