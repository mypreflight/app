import React from "react";
import { AirportWeatherCard } from "~/features/airport/components/AirportWeatherCard";
import { useAirportWeather } from "~/features/airport/hooks/useAirportWeather";
import { BriefingAirportCard } from "~/features/flight/components/Briefing/Airport/BriefingAirportCard";
import { BriefingColumn, BriefingColumns } from "~/features/flight/components/Briefing/BriefingColumns";
import { PassengersSummaryCard } from "~/features/flight/components/Briefing/PassengersSummaryCard";
import { CrewColumn } from "~/features/flight/components/FuelAndLoadsheet/CrewColumn";
import { FuelAndLoadsheetPanel } from "~/features/flight/components/FuelAndLoadsheet/FuelAndLoadsheetPanel";
import { useFlightCabin } from "~/features/flight/hooks/useFlightCabin";
import { useTrackedFlight } from "~/features/flight/hooks/useTrackedFlight";
import { BriefingDocument } from "~/features/flight/lib/briefingPhase";
import type { SpecialServiceRequest } from "~/features/flight/model";

type Props = {
  documentHref: (document: BriefingDocument, request?: SpecialServiceRequest | null) => string;
};

export function PreflightBriefing({ documentHref }: Props) {
  const { flight, loadsheets } = useTrackedFlight();
  const destinationWeather = useAirportWeather(flight?.destinationAirport.id ?? null);
  const cabin = useFlightCabin(flight);

  if (flight === null) {
    return null;
  }

  const { destinationAirport } = flight;

  return (
    <BriefingColumns>
      <BriefingColumn wide>
        <BriefingAirportCard end="departure" />
        {cabin.status === "ready" && (
          <PassengersSummaryCard
            passengers={cabin.manifest.passengers}
            pilHref={(request) => documentHref(BriefingDocument.Pil, request)}
            cabinHref={documentHref(BriefingDocument.Cabin)}
          />
        )}
        <CrewColumn flightId={flight.id} />
      </BriefingColumn>
      <BriefingColumn>
        <FuelAndLoadsheetPanel
          flightId={flight.id}
          serviceType={flight.serviceType}
          preliminary={loadsheets.preliminary}
          final={loadsheets.final}
          timesheet={flight.timesheet}
          arrangement="cards"
          withCrew={false}
        />
        <AirportWeatherCard
          city={destinationAirport.city.name}
          icaoCode={destinationAirport.icaoCode}
          libraryHref={`/airports-library/${destinationAirport.id}`}
          weather={destinationWeather}
        />
      </BriefingColumn>
    </BriefingColumns>
  );
}
