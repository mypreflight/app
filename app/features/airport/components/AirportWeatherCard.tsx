import React from "react";
import { AirportLibraryCode } from "~/features/airport/components/AirportLibraryCode";
import { AirportWeatherReports } from "~/features/airport/components/Weather/AirportWeatherReports";
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
          actions={<AirportLibraryCode icaoCode={icaoCode} href={libraryHref} />}
        />
      }
    >
      <AirportWeatherReports weather={weather} />
    </Container>
  );
}
