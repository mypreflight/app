import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { useDataRefresh } from "~/app-state/useDataRefresh";
import { type Flight, FlightPhase } from "~/features/flight";
import { FlightHistoryPreview } from "~/features/flight/components/List/FlightHistoryPreview";
import { FlightList } from "~/features/flight/components/List/FlightList";
import { blockTimeColumn } from "~/features/flight/components/List/FlightListColumns";
import { pilotLinks } from "~/features/flight/components/List/FlightListLinks";
import { useApi } from "~/shared/api/useApi";

const PAGE_SIZE = 10;
const PREVIEW_DELAY_MS = 120;

export function PilotFlightHistoryList() {
  const { flightService } = useApi();
  const { markRefreshed } = useDataRefresh();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const [previewedId, setPreviewedId] = useState<string | null>(null);
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => clearTimeout(previewTimer.current ?? undefined), []);

  const preview = (flight: Flight) => {
    clearTimeout(previewTimer.current ?? undefined);
    previewTimer.current = setTimeout(() => setPreviewedId(flight.id), PREVIEW_DELAY_MS);
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    flightService
      .fetchAllFlights({ phase: FlightPhase.Finished, page, limit: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return;
        setFlights(res.flights);
        setTotalCount(res.totalCount);
        markRefreshed();
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [flightService, page, markRefreshed]);

  const onPageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", newPage.toString());
    setSearchParams(newParams);
  };

  if (flights.length === 0 && !loading) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-400">
        No flights in your history yet.
      </div>
    );
  }

  const previewed = flights.find((flight) => flight.id === previewedId) ?? flights[0] ?? null;

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <FlightList
        flights={flights}
        loading={loading}
        page={page}
        totalPages={Math.ceil(totalCount / PAGE_SIZE)}
        onPageChange={onPageChange}
        links={pilotLinks}
        trailingColumn={blockTimeColumn}
        previewedId={previewed?.id ?? null}
        onPreview={preview}
      />
      {previewed !== null && <FlightHistoryPreview flight={previewed} className="hidden lg:flex lg:sticky lg:top-6" />}
    </div>
  );
}
