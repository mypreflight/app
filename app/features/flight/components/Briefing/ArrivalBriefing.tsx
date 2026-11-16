import React from "react";
import { FlightAlternateAirportsCard } from "~/features/flight/components/Airports/FlightAlternateAirportsCard";
import { BriefingAirportCard } from "~/features/flight/components/Briefing/Airport/BriefingAirportCard";
import { BriefingColumn, BriefingColumns } from "~/features/flight/components/Briefing/BriefingColumns";
import { LandingFiguresCard } from "~/features/flight/components/Briefing/LandingFiguresCard";
import { useTrackedFlight } from "~/features/flight/hooks/useTrackedFlight";
import { topOfDescentAt } from "~/features/flight/lib/briefingPhase";
import { usePlannedRoute } from "~/features/route/hooks/useRouteBriefing";

const TONNE = 1000;

export function ArrivalBriefing() {
  const { flight, loadsheets } = useTrackedFlight();
  const route = usePlannedRoute();

  if (flight === null) {
    return null;
  }

  const fixes = route?.briefing?.route.fixes ?? [];
  const destination = fixes.at(-1) ?? null;
  const lastReport = [...fixes].reverse().find((fix) => fix.fuelReport !== null) ?? null;
  const loadsheet = loadsheets.final ?? loadsheets.preliminary;

  return (
    <BriefingColumns>
      <BriefingColumn wide>
        <BriefingAirportCard end="arrival" />
      </BriefingColumn>
      <BriefingColumn>
        {destination !== null && (
          <LandingFiguresCard
            destination={destination}
            lastReport={lastReport}
            zeroFuelWeightKg={loadsheet === null ? null : loadsheet.zeroFuelWeight * TONNE}
            topOfDescent={topOfDescentAt(fixes, route?.takeoffTime ?? null)}
          />
        )}
        <FlightAlternateAirportsCard airports={flight.airports} />
      </BriefingColumn>
    </BriefingColumns>
  );
}
