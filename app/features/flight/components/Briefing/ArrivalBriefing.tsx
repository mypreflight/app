import React from "react";
import { AirportWeatherCard } from "~/features/airport/components/AirportWeatherCard";
import { useAirportWeather } from "~/features/airport/hooks/useAirportWeather";
import { FlightAlternateAirportsCard } from "~/features/flight/components/Airports/FlightAlternateAirportsCard";
import { BriefingColumn, BriefingColumns } from "~/features/flight/components/Briefing/BriefingColumns";
import { LandingFiguresCard } from "~/features/flight/components/Briefing/LandingFiguresCard";
import { ParkingPositionRunwayBox } from "~/features/flight/components/Dashboard/Tracking/Box/ParkingPositionRunwayBox";
import { useTrackedFlight } from "~/features/flight/hooks/useTrackedFlight";
import { topOfDescentAt } from "~/features/flight/lib/briefingPhase";
import { usePlannedRoute } from "~/features/route/hooks/useRouteBriefing";

const TONNE = 1000;

export function ArrivalBriefing() {
  const { flight, loadsheets } = useTrackedFlight();
  const route = usePlannedRoute();
  const weather = useAirportWeather(flight?.destinationAirport.id ?? null);

  if (flight === null) {
    return null;
  }

  const fixes = route?.briefing?.route.fixes ?? [];
  const destination = fixes.at(-1) ?? null;
  const lastReport = [...fixes].reverse().find((fix) => fix.fuelReport !== null) ?? null;
  const loadsheet = loadsheets.final ?? loadsheets.preliminary;
  const { destinationAirport } = flight;

  return (
    <BriefingColumns>
      <BriefingColumn>
        <AirportWeatherCard
          city={destinationAirport.city.name}
          icaoCode={destinationAirport.icaoCode}
          libraryHref={`/airports-library/${destinationAirport.id}`}
          weather={weather}
        />
      </BriefingColumn>
      <BriefingColumn>
        <ParkingPositionRunwayBox end="arrival" />
        <FlightAlternateAirportsCard airports={flight.airports} />
      </BriefingColumn>
      {destination !== null && (
        <BriefingColumn>
          <LandingFiguresCard
            destination={destination}
            lastReport={lastReport}
            zeroFuelWeightKg={loadsheet === null ? null : loadsheet.zeroFuelWeight * TONNE}
            topOfDescent={topOfDescentAt(fixes, route?.takeoffTime ?? null)}
          />
        </BriefingColumn>
      )}
    </BriefingColumns>
  );
}
