import { useEffect, useRef, useState } from "react";
import type { Flight, FlightPathElement } from "~/features/flight";
import { useApi } from "~/shared/api/useApi";

const NO_PATH: FlightPathElement[] = [];

export function useFlightPathCache(flight: Flight | null): FlightPathElement[] {
  const { flightService } = useApi();
  const cache = useRef(new Map<string, Promise<FlightPathElement[]>>());
  const [loaded, setLoaded] = useState<{ flightId: string; path: FlightPathElement[] } | null>(null);

  useEffect(() => {
    if (flight === null || !flight.hasFlightPath) {
      return;
    }

    let cancelled = false;
    let request = cache.current.get(flight.id);

    if (request === undefined) {
      request = flightService.fetchFlightPath(flight.id).catch((error) => {
        console.error("Failed to load the flight path preview", error);
        cache.current.delete(flight.id);
        return NO_PATH;
      });
      cache.current.set(flight.id, request);
    }

    request.then((path) => {
      if (!cancelled) setLoaded({ flightId: flight.id, path });
    });

    return () => {
      cancelled = true;
    };
  }, [flight, flightService]);

  return flight !== null && loaded?.flightId === flight.id ? loaded.path : NO_PATH;
}
