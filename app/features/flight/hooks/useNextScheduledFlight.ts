import { useEffect, useMemo, useState } from "react";
import { type Flight, FlightStatus } from "~/features/flight";
import type { Rotation } from "~/features/rotation";
import { useApi } from "~/shared/api/useApi";

type Response = {
  nextFlight: Flight | null;
  loading: boolean;
  failed: boolean;
};

function nextReadyFlightId(rotations: Rotation[], currentFlightId: string | null): string | null {
  const legs = rotations
    .flatMap((rotation) => rotation.orderedLegs)
    .filter((leg) => leg.flight?.status === FlightStatus.Ready && leg.flight.id !== currentFlightId)
    .sort((a, b) => a.offBlockTime.getTime() - b.offBlockTime.getTime());

  return legs[0]?.flight?.id ?? null;
}

export function useNextScheduledFlight(
  rotations: Rotation[],
  rotationsLoading: boolean,
  currentFlightId: string | null,
): Response {
  const { flightService } = useApi();
  const nextFlightId = useMemo(() => nextReadyFlightId(rotations, currentFlightId), [rotations, currentFlightId]);
  const [nextFlight, setNextFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (rotationsLoading) {
      return;
    }

    if (nextFlightId === null) {
      setNextFlight(null);
      setFailed(false);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);

    flightService
      .fetchById(nextFlightId)
      .then((flight) => {
        if (!active) return;
        setNextFlight(flight);
        setFailed(false);
      })
      .catch((err) => {
        if (!active) return;
        console.error("Cannot fetch the next scheduled flight", err);
        setNextFlight(null);
        setFailed(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [flightService, nextFlightId, rotationsLoading]);

  return { nextFlight, loading, failed };
}
