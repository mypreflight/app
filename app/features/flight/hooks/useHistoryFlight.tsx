import React, { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import type { Diversion } from "~/features/diversion";
import type { Flight, FlightEvent, FlightPathElement, Loadsheets } from "~/features/flight";
import { NO_LOADSHEETS } from "~/features/flight/lib/loadsheets";
import { useApi } from "~/shared/api/useApi";

export type HistoryFlightContextType = {
  flight: Flight | null;
  loadsheets: Loadsheets;
  events: FlightEvent[];
  diversion: Diversion | null;
  flightPath: FlightPathElement[];
  pathLoadFailed: boolean;
  loading: boolean;
  loadFailed: boolean;
};

export const HistoryFlightContext = createContext<HistoryFlightContextType | null>(null);

type Props = {
  flightId: string;
  children: ReactNode;
};

export function HistoryFlightProvider({ flightId, children }: Props) {
  const { flightService, diversionService } = useApi();
  const [flight, setFlight] = useState<Flight | null>(null);
  const [loadsheets, setLoadsheets] = useState<Loadsheets>(NO_LOADSHEETS);
  const [events, setEvents] = useState<FlightEvent[]>([]);
  const [diversion, setDiversion] = useState<Diversion | null>(null);
  const [flightPath, setFlightPath] = useState<FlightPathElement[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [pathLoadFailed, setPathLoadFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadFailed(false);
    setFlightPath([]);
    setPathLoadFailed(false);
    flightService
      .fetchById(flightId)
      .then(async (f) => {
        if (cancelled) return;
        setFlight(f);
        const [e, d, l, p] = await Promise.all([
          flightService.fetchEventsByFlightId(flightId),
          f.isFlightDiverted ? diversionService.getByFlight(flightId) : Promise.resolve(null),
          flightService.fetchLoadsheets(flightId),
          f.hasFlightPath
            ? flightService.fetchFlightPath(flightId).catch((error) => {
                console.error("Failed to load the flight path", error);
                if (!cancelled) setPathLoadFailed(true);
                return [];
              })
            : Promise.resolve([]),
        ]);
        if (cancelled) return;
        setEvents(e);
        setDiversion(d);
        setLoadsheets(l);
        setFlightPath(p);
      })
      .catch((error) => {
        console.error("Failed to load flight history", error);
        if (!cancelled) setLoadFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [flightService, diversionService, flightId]);

  return (
    <HistoryFlightContext.Provider
      value={{ flight, loadsheets, events, diversion, flightPath, pathLoadFailed, loading, loadFailed }}
    >
      {children}
    </HistoryFlightContext.Provider>
  );
}

export function useHistoryFlight() {
  const ctx = useContext(HistoryFlightContext);
  if (!ctx) throw new Error("useHistoryFlight must be used within a HistoryFlightProvider");
  return ctx;
}
