import { useEffect, useState } from "react";
import type { AirportWeatherReport } from "~/features/airport";
import { useApi } from "~/shared/api/useApi";

export type AirportWeather = { status: "loading" } | { status: "ready"; reports: AirportWeatherReport[] };

export function useAirportWeather(airportId: string | null): AirportWeather {
  const { airportService } = useApi();
  const [weather, setWeather] = useState<AirportWeather>({ status: "loading" });

  useEffect(() => {
    if (airportId === null) {
      return;
    }

    let cancelled = false;
    setWeather({ status: "loading" });

    airportService
      .fetchWeather(airportId)
      .catch((): AirportWeatherReport[] => [])
      .then((reports) => {
        if (!cancelled) {
          setWeather({ status: "ready", reports });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [airportService, airportId]);

  return weather;
}
