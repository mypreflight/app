import { useEffect, useState } from "react";
import type { ParkingPosition } from "~/features/parking-position";
import type { Runway } from "~/features/runway";
import type { Terminal } from "~/features/terminal";
import { useApi } from "~/shared/api/useApi";

export type EndpointAssignments =
  | { status: "loading" }
  | { status: "failed" }
  | {
      status: "ready";
      runway: Runway | null;
      parkingPosition: ParkingPosition | null;
      terminal: Terminal | null;
    };

type Assigned = {
  airportId: string | null;
  runwayId: string | null;
  parkingPositionId: string | null;
};

export function useEndpointAssignments({ airportId, runwayId, parkingPositionId }: Assigned): EndpointAssignments {
  const { parkingPositionService, runwayService, terminalService } = useApi();
  const [assignments, setAssignments] = useState<EndpointAssignments>({ status: "loading" });

  useEffect(() => {
    if (airportId === null) {
      return;
    }

    let cancelled = false;

    const load = async () => {
      const [runway, parkingPosition] = await Promise.all([
        runwayId === null ? null : (runwayService.fetchById(airportId, runwayId) as Promise<Runway>),
        parkingPositionId === null
          ? null
          : (parkingPositionService.fetchById(airportId, parkingPositionId) as Promise<ParkingPosition>),
      ]);
      const terminals = parkingPosition === null ? [] : ((await terminalService.fetchAll(airportId)) as Terminal[]);
      const terminal = terminals.find((candidate) => candidate.id === parkingPosition?.terminalId) ?? null;

      return { runway, parkingPosition, terminal };
    };

    load().then(
      (loaded) => {
        if (!cancelled) {
          setAssignments({ status: "ready", ...loaded });
        }
      },
      () => {
        if (!cancelled) {
          setAssignments({ status: "failed" });
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, [airportId, runwayId, parkingPositionId, parkingPositionService, runwayService, terminalService]);

  return assignments;
}
