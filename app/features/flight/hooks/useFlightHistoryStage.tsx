import React, {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router";
import { useDataRefresh } from "~/app-state/useDataRefresh";
import { type Flight, type FlightPathElement, FlightPhase } from "~/features/flight";
import { type HistoryTrack, historyTrack } from "~/features/flight/lib/historyOverview";
import { historyFlightPath } from "~/features/flight/lib/historyView";
import { useApi } from "~/shared/api/useApi";
import type { GlobeInsets } from "~/shared/lib/globeCamera";
import type { GlobeCameraState, GlobeEntryCamera } from "~/shared/ui/Globe/GlobeMap";

const PAGE_SIZE = 10;
const HANDOFF_TIMEOUT_MS = 5000;
const FULL_BLEED_QUERY = "(min-width: 768px)";

export type HistoryListStatus = "loading" | "ready" | "failed";

export type FlightHistoryHandoff = {
  flightId: string;
  camera: GlobeEntryCamera;
  startedAt: number;
};

type FlightHistoryList = {
  flights: Flight[];
  totalCount: number;
  status: HistoryListStatus;
  hasMore: boolean;
  isLoadingMore: boolean;
  moreFailed: boolean;
  loadMore: () => void;
  retry: () => void;
  tracks: ReadonlyMap<string, HistoryTrack>;
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
  selectedId: string | null;
  open: (flight: Flight) => void;
  readListScroll: () => number;
  rememberListScroll: (top: number) => void;
};

type FlightHistoryStageView = {
  handoff: FlightHistoryHandoff | null;
  returnCamera: GlobeEntryCamera | null;
  rememberStageCamera: (camera: GlobeCameraState) => void;
  panelInset: number;
  setPanelInset: (inset: number) => void;
  flightInsets: GlobeInsets | null;
};

type FlightHistoryEntry = {
  handoff: FlightHistoryHandoff | null;
  completeHandoff: (flightId: string) => void;
  cachedFlight: (flightId: string) => Flight | null;
  cachedPath: (flightId: string) => FlightPathElement[] | null;
  rememberFlightCamera: (camera: GlobeCameraState) => void;
  reportFlightInsets: (insets: GlobeInsets) => void;
};

export type FlightHistoryStage = FlightHistoryList & FlightHistoryStageView & FlightHistoryEntry;

export const FlightHistoryStageContext = createContext<FlightHistoryStage | null>(null);

type Props = {
  flightId: string | undefined;
  children: ReactNode;
};

function withoutDuplicates(flights: Flight[]): Flight[] {
  const seen = new Set<string>();

  return flights.filter((flight) => {
    if (seen.has(flight.id)) return false;
    seen.add(flight.id);
    return true;
  });
}

export function FlightHistoryStageProvider({ flightId, children }: Props) {
  const { flightService } = useApi();
  const { markRefreshed } = useDataRefresh();
  const navigate = useNavigate();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [status, setStatus] = useState<HistoryListStatus>("loading");
  const [loadedPages, setLoadedPages] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [moreFailed, setMoreFailed] = useState(false);
  const [tracks, setTracks] = useState<ReadonlyMap<string, HistoryTrack>>(new Map());
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [handoff, setHandoff] = useState<FlightHistoryHandoff | null>(null);
  const [returnCamera, setReturnCamera] = useState<GlobeEntryCamera | null>(null);
  const [shownFlightId, setShownFlightId] = useState(flightId);
  const [panelInset, setPanelInset] = useState(0);
  const [flightInsets, setFlightInsets] = useState<GlobeInsets | null>(null);
  const isListVisited = useRef(flightId === undefined);
  const pageInFlight = useRef<number | null>(null);
  const requestedPaths = useRef(new Set<string>());
  const paths = useRef(new Map<string, FlightPathElement[]>());
  const listScroll = useRef(0);
  const stageCamera = useRef<GlobeCameraState | null>(null);
  const flightCamera = useRef<GlobeCameraState | null>(null);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const fetchPage = useCallback(
    (page: number) => {
      if (pageInFlight.current !== null) return;

      pageInFlight.current = page;
      if (page > 1) {
        setIsLoadingMore(true);
        setMoreFailed(false);
      }

      flightService
        .fetchAllFlights({ phase: FlightPhase.Finished, page, limit: PAGE_SIZE })
        .then((response) => {
          if (!alive.current) return;
          setFlights((current) => withoutDuplicates(page === 1 ? response.flights : [...current, ...response.flights]));
          setTotalCount(response.totalCount);
          setLoadedPages(page);
          setStatus("ready");
          markRefreshed();
        })
        .catch((error) => {
          console.error("Failed to load the flight history", error);
          if (!alive.current) return;
          if (page === 1) {
            setStatus("failed");
          } else {
            setMoreFailed(true);
          }
        })
        .finally(() => {
          pageInFlight.current = null;
          if (alive.current) setIsLoadingMore(false);
        });
    },
    [flightService, markRefreshed],
  );

  useEffect(() => {
    if (flightId === undefined) isListVisited.current = true;
    if (isListVisited.current && status === "loading") fetchPage(1);
  }, [fetchPage, flightId, status]);

  useEffect(() => {
    for (const flight of flights) {
      if (requestedPaths.current.has(flight.id)) continue;
      requestedPaths.current.add(flight.id);

      const request = flight.hasFlightPath
        ? flightService.fetchFlightPath(flight.id).catch((error) => {
            console.error("Failed to load the flight path", error);
            return null;
          })
        : Promise.resolve(null);

      request.then((path) => {
        if (!alive.current) return;
        if (path !== null) paths.current.set(flight.id, path);
        setTracks((current) => new Map(current).set(flight.id, historyTrack(flight, path)));
      });
    }
  }, [flights, flightService]);

  useEffect(() => {
    if (handoff === null) return;

    const timer = window.setTimeout(() => setHandoff(null), HANDOFF_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [handoff]);

  useEffect(() => {
    if (flightId === shownFlightId) return;

    setShownFlightId(flightId);

    if (flightId === undefined) {
      setSelectedId(null);
      setHoveredId(null);
      setHandoff(null);
      if (shownFlightId !== undefined && flightCamera.current !== null) {
        setReturnCamera({ key: `return-${shownFlightId}-${Date.now()}`, read: () => flightCamera.current });
      }
    }
  }, [flightId, shownFlightId]);

  const open = useCallback(
    (flight: Flight) => {
      const fullBleed = window.matchMedia(FULL_BLEED_QUERY).matches;

      setSelectedId(flight.id);
      flightCamera.current = null;
      setHandoff(
        fullBleed && stageCamera.current !== null
          ? {
              flightId: flight.id,
              camera: { key: `handoff-${flight.id}-${Date.now()}`, read: () => stageCamera.current },
              startedAt: performance.now(),
            }
          : null,
      );
      navigate(historyFlightPath(flight.id));
    },
    [navigate],
  );

  const completeHandoff = useCallback((id: string) => {
    setHandoff((current) => (current?.flightId === id ? null : current));
  }, []);

  const cachedFlight = useCallback((id: string) => flights.find((flight) => flight.id === id) ?? null, [flights]);
  const cachedPath = useCallback((id: string) => paths.current.get(id) ?? null, []);

  const rememberStageCamera = useCallback((camera: GlobeCameraState) => {
    stageCamera.current = camera;
  }, []);
  const rememberFlightCamera = useCallback((camera: GlobeCameraState) => {
    flightCamera.current = camera;
  }, []);
  const readListScroll = useCallback(() => listScroll.current, []);
  const rememberListScroll = useCallback((top: number) => {
    listScroll.current = top;
  }, []);
  const reportFlightInsets = useCallback((insets: GlobeInsets) => {
    setFlightInsets((current) =>
      current !== null && current.top === insets.top && current.bottom === insets.bottom ? current : insets,
    );
  }, []);

  const loadMore = useCallback(() => {
    if (loadedPages * PAGE_SIZE < totalCount) fetchPage(loadedPages + 1);
  }, [fetchPage, loadedPages, totalCount]);

  const retry = useCallback(() => {
    if (status === "failed") {
      setStatus("loading");
      fetchPage(1);
    } else {
      fetchPage(loadedPages + 1);
    }
  }, [fetchPage, loadedPages, status]);

  const value = useMemo(
    (): FlightHistoryStage => ({
      flights,
      totalCount,
      status,
      hasMore: loadedPages * PAGE_SIZE < totalCount,
      isLoadingMore,
      moreFailed,
      loadMore,
      retry,
      tracks,
      hoveredId,
      setHoveredId,
      selectedId,
      open,
      readListScroll,
      rememberListScroll,
      handoff,
      returnCamera,
      rememberStageCamera,
      panelInset,
      setPanelInset,
      flightInsets,
      completeHandoff,
      cachedFlight,
      cachedPath,
      rememberFlightCamera,
      reportFlightInsets,
    }),
    [
      flights,
      totalCount,
      status,
      loadedPages,
      isLoadingMore,
      moreFailed,
      loadMore,
      retry,
      tracks,
      hoveredId,
      selectedId,
      open,
      readListScroll,
      rememberListScroll,
      handoff,
      returnCamera,
      rememberStageCamera,
      panelInset,
      flightInsets,
      completeHandoff,
      cachedFlight,
      cachedPath,
      rememberFlightCamera,
      reportFlightInsets,
    ],
  );

  return <FlightHistoryStageContext.Provider value={value}>{children}</FlightHistoryStageContext.Provider>;
}

export function useFlightHistoryStage(): FlightHistoryStage {
  const context = useContext(FlightHistoryStageContext);
  if (!context) throw new Error("useFlightHistoryStage must be used within a FlightHistoryStageProvider");
  return context;
}

export function useFlightHistoryEntry(): FlightHistoryEntry | null {
  return useContext(FlightHistoryStageContext);
}
