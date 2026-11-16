import React from "react";
import { Link } from "react-router";
import { AirportWeatherPanel } from "~/features/airport/components/Library/AirportWeatherPanel";
import type { AirportWeather } from "~/features/airport/hooks/useAirportWeather";
import { CardHeader } from "~/shared/ui/Layout/CardHeader";
import { Container } from "~/shared/ui/Layout/Container";

type Props = {
  city: string;
  icaoCode: string;
  libraryHref: string;
  weather: AirportWeather;
};

export function AirportWeatherCard({ city, icaoCode, libraryHref, weather }: Props) {
  return (
    <Container
      padding="condensed"
      header={
        <CardHeader
          title={`Weather at ${city}`}
          actions={
            <Link
              to={libraryHref}
              className="font-mono text-xs font-bold text-indigo-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-indigo-400"
            >
              {icaoCode}
            </Link>
          }
        />
      }
    >
      {weather.status === "loading" ? (
        <div className="h-24 animate-pulse rounded-lg bg-gray-100 motion-reduce:animate-none dark:bg-gray-800" />
      ) : (
        <AirportWeatherPanel reports={weather.reports} />
      )}
    </Container>
  );
}
