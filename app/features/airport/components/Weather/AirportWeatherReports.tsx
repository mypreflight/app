import React, { type ReactNode, useState } from "react";
import type { IconType } from "react-icons";
import { LuCloudOff, LuTriangleAlert } from "react-icons/lu";
import { useAuth } from "~/app-state/useAuth";
import {
  type AirportWeatherReport,
  resolveWeatherSource,
  WeatherInformationType,
  type WeatherSource,
} from "~/features/airport";
import { WeatherSourceSwitch } from "~/features/airport/components/Library/WeatherSourceSwitch";
import type { AirportWeather } from "~/features/airport/hooks/useAirportWeather";
import { translateWeatherInformationType, translateWeatherSource } from "~/features/airport/i18n";
import { tafLines } from "~/features/airport/lib/tafLines";
import { dateToZuluStamp } from "~/shared/ui/Date/zuluStamp";
import { PanelSection } from "~/shared/ui/Layout/PanelSection";

const CODED_TYPES = [WeatherInformationType.Metar, WeatherInformationType.Taf];
const SECTION_SPACING = "py-3 first:pt-0 last:pb-0";

type Props = {
  weather: AirportWeather;
};

export function AirportWeatherReports({ weather }: Props) {
  switch (weather.status) {
    case "loading":
      return <WeatherSkeleton />;
    case "failed":
      return (
        <WeatherNote icon={LuTriangleAlert}>Weather could not be loaded. Reload the page to try again.</WeatherNote>
      );
    case "ready":
      return <Reports reports={weather.reports} />;
  }
}

function Reports({ reports }: { reports: AirportWeatherReport[] }) {
  const { user } = useAuth();
  const [source, setSource] = useState(resolveWeatherSource(user?.defaultWeatherSource));

  if (reports.length === 0) {
    return <WeatherNote icon={LuCloudOff}>No weather reported for this airport.</WeatherNote>;
  }

  const coded = CODED_TYPES.flatMap((type) =>
    reports.filter((report) => report.source === source && report.informationType === type),
  );
  const atis = reports.find((report) => report.informationType === WeatherInformationType.Atis) ?? null;

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div>
        <WeatherSourceSwitch selected={source} onSelect={setSource} />
      </div>
      <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-800">
        {coded.length === 0 ? (
          <div className={SECTION_SPACING}>
            <WeatherNote icon={LuCloudOff}>No METAR or TAF from {translateWeatherSource(source)}.</WeatherNote>
          </div>
        ) : (
          coded.map((report) => <CodedReport key={report.id} report={report} />)
        )}
        <AtisReport report={atis} />
      </div>
    </div>
  );
}

function CodedReport({ report }: { report: AirportWeatherReport }) {
  const lines = report.informationType === WeatherInformationType.Taf ? tafLines(report.content) : [report.content];

  return (
    <PanelSection
      className={SECTION_SPACING}
      title={translateWeatherInformationType(report.informationType)}
      aside={<UpdatedAt report={report} />}
    >
      <p className="break-words font-mono text-sm leading-relaxed text-gray-900 dark:text-gray-100">
        {lines.map((line, index) => (
          <span key={line} className={index === 0 ? "block" : "block ps-4"}>
            {line}
          </span>
        ))}
      </p>
    </PanelSection>
  );
}

function AtisReport({ report }: { report: AirportWeatherReport | null }) {
  return (
    <PanelSection
      className={SECTION_SPACING}
      title={translateWeatherInformationType(WeatherInformationType.Atis)}
      aside={report === null ? null : <UpdatedAt report={report} source={report.source} />}
    >
      {report === null ? (
        <WeatherNote icon={LuCloudOff}>No ATIS for this airport.</WeatherNote>
      ) : (
        <p className="max-w-prose text-pretty font-mono text-xs leading-relaxed text-gray-800 dark:text-gray-200">
          {report.content}
        </p>
      )}
    </PanelSection>
  );
}

function UpdatedAt({ report, source }: { report: AirportWeatherReport; source?: WeatherSource }) {
  return (
    <span>
      {source === undefined ? "Updated" : `${translateWeatherSource(source)} · Updated`}{" "}
      <span className="font-mono text-gray-700 dark:text-gray-300">
        {dateToZuluStamp(new Date(report.lastFetched))}
      </span>
    </span>
  );
}

function WeatherNote({ icon: Icon, children }: { icon: IconType; children: ReactNode }) {
  return (
    <p className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
      <Icon aria-hidden={true} className="size-4 shrink-0" />
      {children}
    </p>
  );
}

function WeatherSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading weather"
      className="flex animate-pulse flex-col gap-3 motion-reduce:animate-none"
    >
      <div className="h-7 w-60 max-w-full rounded-lg bg-gray-100 dark:bg-gray-800" />
      <div className="flex flex-col gap-2">
        <div className="h-3 w-12 rounded bg-gray-100 dark:bg-gray-800" />
        <div className="h-10 rounded-lg bg-gray-100 dark:bg-gray-800" />
      </div>
      <div className="flex flex-col gap-2">
        <div className="h-3 w-10 rounded bg-gray-100 dark:bg-gray-800" />
        <div className="h-14 rounded-lg bg-gray-100 dark:bg-gray-800" />
      </div>
    </div>
  );
}
