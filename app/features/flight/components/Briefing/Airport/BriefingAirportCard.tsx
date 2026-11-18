import React, { type ReactNode, useState } from "react";
import { useAuth } from "~/app-state/useAuth";
import { useToast } from "~/app-state/useToast";
import { type AirportWeatherReport, resolveWeatherSource } from "~/features/airport";
import { AirportWeatherReports } from "~/features/airport/components/Weather/AirportWeatherReports";
import { useAirportWeather } from "~/features/airport/hooks/useAirportWeather";
import { useAtisChoice } from "~/features/airport/hooks/useAtisChoice";
import { type AtisEnd, atisLetter, runwaysInUse, runwayUse } from "~/features/airport/lib/atis";
import { metarWind, type Wind, windComponents } from "~/features/airport/lib/wind";
import { type Flight, FlightStatus } from "~/features/flight";
import {
  AssignButton,
  RunwaySection,
  StandSection,
} from "~/features/flight/components/Briefing/Airport/AirportGroundSections";
import { DiversionNotice } from "~/features/flight/components/Briefing/Airport/DiversionNotice";
import { SelectParkingPositionModal } from "~/features/flight/components/Modal/SelectParkingPositionModal";
import { SelectRunwayModal } from "~/features/flight/components/Modal/SelectRunwayModal";
import { type EndpointAssignments, useEndpointAssignments } from "~/features/flight/hooks/useEndpointAssignments";
import { useTrackedFlight } from "~/features/flight/hooks/useTrackedFlight";
import type { Runway } from "~/features/runway";
import { AtisElsewhereChip, AtisUseChip, WindChip } from "~/features/runway/components/RunwayChips";
import { useRunwayDesignators } from "~/features/runway/hooks/useRunwayDesignators";
import { useApi } from "~/shared/api/useApi";
import { AirportIdentity } from "~/shared/ui/Display/AirportIdentity";
import { CardHeader } from "~/shared/ui/Layout/CardHeader";
import { Container } from "~/shared/ui/Layout/Container";

export type AirportEnd = AtisEnd;

type Editing = "runway" | "parkingPosition" | null;

const TITLES: Record<AirportEnd, string> = {
  departure: "Departure airport",
  arrival: "Arrival airport",
};

const BEFORE_TAXI = [
  FlightStatus.Created,
  FlightStatus.Ready,
  FlightStatus.CheckedIn,
  FlightStatus.BoardingStarted,
  FlightStatus.BoardingFinished,
];

const RUNWAY_CHANGEABLE: Record<AirportEnd, Set<FlightStatus>> = {
  departure: new Set(BEFORE_TAXI),
  arrival: new Set([...BEFORE_TAXI, FlightStatus.TaxiingOut, FlightStatus.InCruise]),
};

const PARKING_POSITION_CHANGEABLE: Record<AirportEnd, Set<FlightStatus>> = {
  departure: new Set([FlightStatus.Created, FlightStatus.Ready, FlightStatus.CheckedIn]),
  arrival: new Set([...BEFORE_TAXI, FlightStatus.TaxiingOut, FlightStatus.InCruise, FlightStatus.TaxiingIn]),
};

const RUNWAY_LOCKED_AFTER: Record<AirportEnd, string> = {
  departure: "off-block",
  arrival: "arrival",
};

const PARKING_POSITION_LOCKED_AFTER: Record<AirportEnd, string> = {
  departure: "boarding starts",
  arrival: "on-block",
};

function lockReason(changeable: boolean, diverting: boolean, lockedAfter: string): string | null {
  if (changeable) {
    return null;
  }

  return diverting ? "Cannot assign while diverting" : `Cannot assign after ${lockedAfter}`;
}

function assignedIds(flight: Flight | null, end: AirportEnd) {
  if (flight === null) {
    return { airportId: null, runwayId: null, parkingPositionId: null };
  }

  return end === "departure"
    ? {
        airportId: flight.departureAirport.id,
        runwayId: flight.departureRunwayId,
        parkingPositionId: flight.departureParkingPositionId,
      }
    : {
        airportId: flight.destinationAirport.id,
        runwayId: flight.arrivalRunwayId,
        parkingPositionId: flight.arrivalParkingPositionId,
      };
}

type RunwayChipsInput = {
  runway: Runway | null;
  end: AirportEnd;
  report: AirportWeatherReport | null;
  designators: Map<string, string> | null;
  wind: Wind | null;
};

function runwayChips({ runway, end, report, designators, wind }: RunwayChipsInput): ReactNode {
  if (runway === null) {
    return null;
  }

  const letter = report === null ? null : atisLetter(report.content);
  const use = runwayUse(report, runway.id);
  const elsewhere =
    report === null || designators === null
      ? []
      : runwaysInUse(report, end).flatMap((runwayId) => designators.get(runwayId) ?? []);

  return (
    <>
      {use.arrival || use.departure ? (
        <AtisUseChip letter={letter} use={use} />
      ) : (
        <AtisElsewhereChip letter={letter} end={end} designators={elsewhere} />
      )}
      {wind !== null && (
        <WindChip wind={wind} components={windComponents(wind, runway.trueHeading ?? runway.magneticHeading)} />
      )}
    </>
  );
}

function loadable<Key extends "runway" | "parkingPosition" | "terminal">(assignments: EndpointAssignments, key: Key) {
  return assignments.status === "ready"
    ? ({ loading: false, value: assignments[key] } as const)
    : ({ loading: true } as const);
}

type Props = {
  end: AirportEnd;
};

export function BriefingAirportCard({ end }: Props) {
  const { flight, diversion, reload } = useTrackedFlight();
  const { user } = useAuth();
  const { flightService } = useApi();
  const { success, error } = useToast();
  const [editing, setEditing] = useState<Editing>(null);
  const ids = assignedIds(flight, end);
  const weather = useAirportWeather(ids.airportId);
  const atis = useAtisChoice(weather, end);
  const designators = useRunwayDesignators(ids.airportId);
  const assignments = useEndpointAssignments(ids);

  if (flight === null) {
    return null;
  }

  const airport = end === "departure" ? flight.departureAirport : flight.destinationAirport;
  const activeDiversion = end === "arrival" ? diversion : null;
  const canChangeRunway = activeDiversion === null && RUNWAY_CHANGEABLE[end].has(flight.status);
  const canChangeParkingPosition = activeDiversion === null && PARKING_POSITION_CHANGEABLE[end].has(flight.status);
  const kind = end === "departure" ? "Departure" : "Arrival";
  const diverting = activeDiversion !== null;
  const runwayLock = lockReason(canChangeRunway, diverting, RUNWAY_LOCKED_AFTER[end]);
  const wind =
    weather.status === "ready" ? metarWind(weather.reports, resolveWeatherSource(user?.defaultWeatherSource)) : null;
  const parkingPositionLock = lockReason(canChangeParkingPosition, diverting, PARKING_POSITION_LOCKED_AFTER[end]);

  const assign = async (call: () => Promise<void>, subject: string) => {
    try {
      await call();
      setEditing(null);
      await reload();
      success(`${kind} ${subject} updated.`);
    } catch {
      error(`Failed to update ${kind.toLowerCase()} ${subject}. Try again.`);
    }
  };

  const stand = (
    <StandSection
      key="stand"
      stand={loadable(assignments, "parkingPosition")}
      terminal={assignments.status === "ready" ? assignments.terminal : null}
      lock={parkingPositionLock}
      action={
        canChangeParkingPosition ? (
          <AssignButton
            assigned={ids.parkingPositionId !== null}
            subject="parking stand"
            onClick={() => setEditing("parkingPosition")}
          />
        ) : null
      }
    />
  );
  const runway = (
    <RunwaySection
      key="runway"
      title={`${kind} runway`}
      chips={runwayChips({
        runway: assignments.status === "ready" ? assignments.runway : null,
        end,
        report: atis.reports[0] ?? null,
        designators,
        wind,
      })}
      assigned={loadable(assignments, "runway")}
      lock={runwayLock}
      action={
        canChangeRunway ? (
          <AssignButton assigned={ids.runwayId !== null} subject="runway" onClick={() => setEditing("runway")} />
        ) : null
      }
    />
  );

  return (
    <Container padding="condensed" header={<CardHeader title={TITLES[end]} />}>
      {activeDiversion !== null && <DiversionNotice diversion={activeDiversion} />}

      <div className={activeDiversion === null ? undefined : "line-through decoration-2 opacity-60"}>
        <AirportIdentity
          iataCode={airport.iataCode}
          name={airport.name}
          city={airport.city.name}
          country={airport.country.name}
          shape={airport.shape}
          href={`/airports-library/${airport.id}`}
        />
      </div>

      <div className="@container border-t border-gray-200 pt-3 dark:border-gray-800">
        <div className="grid grid-cols-1 @2xl:grid-cols-2">
          <div className="min-w-0 pb-4 @2xl:pe-5 @2xl:pb-0">
            <AirportWeatherReports weather={weather} atis={atis} />
          </div>
          <div className="min-w-0 border-t border-gray-200 pt-3 @2xl:border-s @2xl:border-t-0 @2xl:ps-5 @2xl:pt-0 dark:border-gray-800">
            {assignments.status === "failed" ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                The runway and stand could not be loaded. Reload the page to try again.
              </p>
            ) : (
              <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-800">
                {end === "departure" ? [stand, runway] : [runway, stand]}
              </div>
            )}
          </div>
        </div>
      </div>

      {editing === "parkingPosition" && canChangeParkingPosition && (
        <SelectParkingPositionModal
          airport={airport}
          currentSelectionId={ids.parkingPositionId}
          select={(parkingPositionId) =>
            assign(
              () =>
                end === "departure"
                  ? flightService.assignDepartureParkingPosition(flight.id, parkingPositionId)
                  : flightService.assignArrivalParkingPosition(flight.id, parkingPositionId),
              "parking stand",
            )
          }
          cancel={() => setEditing(null)}
        />
      )}
      {editing === "runway" && canChangeRunway && (
        <SelectRunwayModal
          airport={airport}
          kind={end}
          weather={weather}
          atisSource={atis.source}
          currentSelectionId={ids.runwayId}
          select={(runwayId) =>
            assign(
              () =>
                end === "departure"
                  ? flightService.assignDepartureRunway(flight.id, runwayId)
                  : flightService.assignArrivalRunway(flight.id, runwayId),
              "runway",
            )
          }
          cancel={() => setEditing(null)}
        />
      )}
    </Container>
  );
}
