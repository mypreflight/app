import { useEffect, useState } from "react";
import type { AirportWeatherReport } from "~/features/airport";
import { useApi } from "~/shared/api/useApi";

export type AirportWeather =
  | { status: "loading" }
  | { status: "failed" }
  | { status: "ready"; reports: AirportWeatherReport[] };

export function useAirportWeather(airportId: string | null): AirportWeather {
  const { airportService } = useApi();
  const [weather, setWeather] = useState<AirportWeather>({ status: "loading" });

  useEffect(() => {
    if (airportId === null) {
      return;
    }

    let cancelled = false;
    setWeather({ status: "loading" });

    airportService.fetchWeather(airportId).then(
      (reports) => {
        if (!cancelled) {
          setWeather({ status: "ready", reports });
        }
      },
      () => {
        if (!cancelled) {
          setWeather({ status: "failed" });
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, [airportService, airportId]);

  return weather;
}
