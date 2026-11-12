import { Button } from "flowbite-react";
import React, { useEffect, useLayoutEffect, useRef } from "react";
import { LuTriangleAlert } from "react-icons/lu";
import { twMerge } from "tailwind-merge";
import { FlightHistoryPanelRow } from "~/features/flight/components/List/History/FlightHistoryPanelRow";
import { useFlightHistoryStage } from "~/features/flight/hooks/useFlightHistoryStage";

const SKELETON_KEYS = ["first", "second", "third", "fourth", "fifth", "sixth"];
const PREFETCH_MARGIN = "0px 0px 240px 0px";

function SkeletonRow() {
  return (
    <li aria-hidden={true} className="flex items-center gap-3 px-4 py-3">
      <span className="size-8 shrink-0 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
      <span className="flex flex-1 flex-col gap-1.5">
        <span className="h-3.5 w-16 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
        <span className="h-3 w-24 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
      </span>
    </li>
  );
}

function FailedNotice({ title, onRetry }: { title: string; onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-2 px-4 py-8 text-center">
      <LuTriangleAlert aria-hidden={true} className="size-5 text-gray-500 dark:text-gray-400" />
      <p className="text-sm text-gray-700 dark:text-gray-200">{title}</p>
      <Button color="light" size="sm" className="mt-1" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}

type Props = {
  leaving: boolean;
  parked: boolean;
};

export function FlightHistoryPanel({ leaving, parked }: Props) {
  const {
    flights,
    totalCount,
    status,
    hasMore,
    isLoadingMore,
    moreFailed,
    loadMore,
    retry,
    hoveredId,
    setHoveredId,
    selectedId,
    open,
    setPanelInset,
    readListScroll,
    rememberListScroll,
  } = useFlightHistoryStage();
  const panelRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const canLoadMore = hasMore && !isLoadingMore && !moreFailed;

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (panel === null) return;

    const measure = () => {
      const overlays = window.getComputedStyle(panel).position === "absolute";
      setPanelInset(overlays ? panel.offsetLeft + panel.offsetWidth : 0);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(panel);
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [setPanelInset]);

  useLayoutEffect(() => {
    const list = listRef.current;
    const scroller =
      list === null ? null : window.getComputedStyle(list).overflowY === "auto" ? list : list.closest("main");
    if (parked || scroller === null) return;

    scroller.scrollTop = readListScroll();
    const remember = () => rememberListScroll(scroller.scrollTop);
    scroller.addEventListener("scroll", remember, { passive: true });
    return () => scroller.removeEventListener("scroll", remember);
  }, [parked, readListScroll, rememberListScroll]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const list = listRef.current;
    if (parked || !canLoadMore || sentinel === null || list === null) return;

    const scrolls = window.getComputedStyle(list).overflowY === "auto";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { root: scrolls ? list : null, rootMargin: PREFETCH_MARGIN },
    );
    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [parked, canLoadMore, loadMore]);

  return (
    <section
      ref={panelRef}
      data-history-panel=""
      aria-labelledby="flight-history-title"
      inert={leaving || undefined}
      className={twMerge(
        "relative z-10 mt-3 flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-[opacity,translate] duration-[420ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none md:absolute md:inset-y-6 md:left-6 md:mt-0 md:w-[clamp(17rem,22%,22rem)] dark:border-gray-800 dark:bg-gray-900",
        leaving &&
          "invisible -translate-x-6 opacity-0 transition-[opacity,translate,visibility] duration-[240ms] ease-[cubic-bezier(0.4,0,1,1)]",
        parked && "max-md:hidden",
      )}
    >
      <header className="flex items-baseline justify-between gap-3 border-b border-gray-200 px-4 py-3.5 dark:border-gray-800">
        <h1 id="flight-history-title" className="text-xl font-bold text-gray-900 dark:text-white">
          Flight history
        </h1>
        {status === "ready" && totalCount > 0 && (
          <span className="font-mono text-xs tabular-nums text-gray-500 dark:text-gray-400">
            {totalCount} {totalCount === 1 ? "flight" : "flights"}
          </span>
        )}
      </header>

      {status === "failed" && <FailedNotice title="Your flight history could not be loaded." onRetry={retry} />}

      {status === "ready" && flights.length === 0 && (
        <p className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
          No flights in your history yet.
        </p>
      )}

      <div ref={listRef} className="min-h-0 flex-1 md:overflow-y-auto md:overscroll-contain">
        <ol aria-busy={status === "loading" || isLoadingMore} className="divide-y divide-gray-100 dark:divide-gray-800">
          {status === "loading" && SKELETON_KEYS.map((key) => <SkeletonRow key={key} />)}
          {flights.map((flight) => (
            <FlightHistoryPanelRow
              key={flight.id}
              flight={flight}
              highlighted={flight.id === (selectedId ?? hoveredId)}
              onHover={setHoveredId}
              onOpen={open}
            />
          ))}
          {isLoadingMore && <SkeletonRow />}
        </ol>
        {moreFailed && <FailedNotice title="More flights could not be loaded." onRetry={retry} />}
        <div ref={sentinelRef} aria-hidden={true} className="h-px" />
      </div>
    </section>
  );
}
