import { useCallback, useEffect, useState } from "react";
import { type Flight, FlightListOrder, FlightListSort, FlightPhase } from "~/features/flight";
import { useApi } from "~/shared/api/useApi";

const RECENT_FLIGHTS = 3;

type Response = {
  recentFlights: Flight[];
  lastFlight: Flight | null;
  loading: boolean;
  failed: boolean;
};

export function useRecentFlights(): Response {
  const [recentFlights, setRecentFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const { flightService } = useApi();

  const fetchRecentFlights = useCallback(async () => {
    setLoading(true);
    flightService
      .fetchAllFlights({
        phase: FlightPhase.Finished,
        sort: FlightListSort.ActualOnBlockTime,
        order: FlightListOrder.Descending,
        limit: RECENT_FLIGHTS,
      })
      .then((res) => {
        setRecentFlights(res.flights);
        setFailed(false);
      })
      .catch((err) => {
        console.error("Cannot fetch recent flights", err);
        setRecentFlights([]);
        setFailed(true);
      })
      .finally(() => setLoading(false));
  }, [flightService]);

  useEffect(() => {
    fetchRecentFlights();
  }, [fetchRecentFlights]);

  return { recentFlights, lastFlight: recentFlights[0] ?? null, loading, failed };
}
