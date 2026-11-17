import { useState } from "react";
import { useAuth } from "~/app-state/useAuth";
import { type AirportWeatherReport, type AtisSource, resolveAtisSource } from "~/features/airport";
import type { AirportWeather } from "~/features/airport/hooks/useAirportWeather";
import { type AtisEnd, atisReports, atisSources, preferredAtisSource } from "~/features/airport/lib/atis";

export type AtisChoice = {
  sources: AtisSource[];
  source: AtisSource | null;
  select: (source: AtisSource) => void;
  reports: AirportWeatherReport[];
};

export function useAtisChoice(
  weather: AirportWeather,
  end: AtisEnd | null,
  initial: AtisSource | null = null,
): AtisChoice {
  const { user } = useAuth();
  const [chosen, setChosen] = useState<AtisSource | null>(initial);
  const all = weather.status === "ready" ? weather.reports : [];
  const sources = atisSources(all, end);
  const source =
    chosen !== null && sources.includes(chosen)
      ? chosen
      : preferredAtisSource(sources, resolveAtisSource(user?.defaultAtisSource));

  return {
    sources,
    source,
    select: setChosen,
    reports: source === null ? [] : atisReports(all, source, end),
  };
}
