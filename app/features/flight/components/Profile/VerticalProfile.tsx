import React, { type KeyboardEvent, type PointerEvent, useEffect, useId, useMemo, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import type { FlightPathElement, Timesheet } from "~/features/flight";
import {
  altitudeTicks,
  formatFlightLevel,
  nearestSample,
  type PlannedPoint,
  type ProfileSample,
  type ProfileWindow,
  panProfile,
  placeProfileWindow,
  profileDomain,
  profileSamples,
  profileWindow,
  revealInProfile,
  timeTicks,
  zoomProfile,
} from "~/features/flight/lib/verticalProfile";
import { useElementSize } from "~/shared/hooks/useElementSize";
import { dateToIcaoTime } from "~/shared/ui/Date/FormattedIcaoTime";

const LEFT_GUTTER = 44;
const RIGHT_GUTTER = 52;
const TOP_PADDING = 6;
const AXIS_HEIGHT = 18;
const TICK_SPACING = 96;
const EDGE_CLEARANCE = 76;
const PAGE_STEP = 10;
const WHEEL_ZOOM_RATE = 1 / 250;
const PINCH_ZOOM_RATE = 1 / 100;
const LINE_PIXELS = 40;
const KEY_ZOOM_FACTOR = 2;

type Gesture =
  | { kind: "drag"; pointerId: number; originX: number; view: ProfileWindow }
  | { kind: "pinch"; distance: number; span: number; anchor: number };

type Props = {
  path: FlightPathElement[];
  timesheet: Timesheet;
  planned?: PlannedPoint[];
  cursorIndex: number | null;
  onCursorChange: (index: number | null) => void;
  view?: ProfileWindow | null;
  onViewChange?: (view: ProfileWindow | null) => void;
  plotHeight?: number;
  className?: string;
};

function linePath(points: [number, number][]): string {
  return points.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join("");
}

function describeSample(sample: ProfileSample): string {
  const parts = [`${dateToIcaoTime(new Date(sample.time))}Z`];

  if (sample.altitude !== null) {
    parts.push(`${Math.round(sample.altitude).toLocaleString("en-US")} ft`);
  }
  if (sample.groundSpeed !== null) {
    parts.push(`ground speed ${Math.round(sample.groundSpeed)} kt`);
  }

  return parts.join(", ");
}

const NO_PLAN: PlannedPoint[] = [];

function wheelPixels(event: WheelEvent, delta: number): number {
  return event.deltaMode === WheelEvent.DOM_DELTA_LINE ? delta * LINE_PIXELS : delta;
}

function touchSpread(touches: Map<number, number>): { distance: number; middle: number } {
  const [first, second] = [...touches.values()];

  return { distance: Math.max(Math.abs(second - first), 1), middle: (first + second) / 2 };
}

export function VerticalProfile({
  path,
  timesheet,
  planned = NO_PLAN,
  cursorIndex,
  onCursorChange,
  view = null,
  onViewChange,
  plotHeight = 88,
  className,
}: Props) {
  const { ref, width } = useElementSize<HTMLDivElement>();
  const clipId = `profile-plot-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const samples = useMemo(() => profileSamples(path), [path]);
  const domain = useMemo(() => profileDomain(samples, timesheet, planned), [samples, timesheet, planned]);
  const visible = profileWindow(domain, view);
  const touches = useRef(new Map<number, number>());
  const gesture = useRef<Gesture | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const plotLeft = LEFT_GUTTER;
  const plotRight = Math.max(plotLeft + 1, width - RIGHT_GUTTER);
  const plotBottom = TOP_PADDING + plotHeight;
  const height = plotBottom + AXIS_HEIGHT;
  const plotWidth = plotRight - plotLeft;
  const span = visible.end - visible.start;

  const x = (time: number) => plotLeft + ((time - visible.start) / span) * plotWidth;
  const timeAt = (offset: number) => visible.start + (Math.min(Math.max(offset, 0), plotWidth) / plotWidth) * span;

  const latest = useRef({ domain, view, visible, plotLeft, plotWidth, onViewChange });
  latest.current = { domain, view, visible, plotLeft, plotWidth, onViewChange };

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const zoomOnWheel = (event: WheelEvent) => {
      const current = latest.current;

      if (current.onViewChange === undefined) {
        return;
      }

      const currentSpan = current.visible.end - current.visible.start;
      const sideways = event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY);

      if (sideways) {
        if (current.view === null) {
          return;
        }

        const pixels = wheelPixels(event, event.deltaX === 0 ? event.deltaY : event.deltaX);
        event.preventDefault();
        current.onViewChange(panProfile(current.domain, current.view, (pixels / current.plotWidth) * currentSpan));
        return;
      }

      const rate = event.ctrlKey ? PINCH_ZOOM_RATE : WHEEL_ZOOM_RATE;
      const offset = event.clientX - element.getBoundingClientRect().left - current.plotLeft;
      const anchor =
        current.visible.start + (Math.min(Math.max(offset, 0), current.plotWidth) / current.plotWidth) * currentSpan;
      const next = zoomProfile(current.domain, current.view, 2 ** (wheelPixels(event, event.deltaY) * rate), anchor);

      if (next === null && current.view === null) {
        return;
      }

      event.preventDefault();
      current.onViewChange(next);
    };

    element.addEventListener("wheel", zoomOnWheel, { passive: false });

    return () => element.removeEventListener("wheel", zoomOnWheel);
  }, [ref]);
  const altitudeY = (altitude: number) => plotBottom - (altitude / domain.ceiling) * plotHeight;
  const speedY = (speed: number) => plotBottom - (speed / domain.topSpeed) * plotHeight;

  const altitudePoints = samples.flatMap(({ time, altitude }): [number, number][] =>
    altitude === null ? [] : [[x(time), altitudeY(altitude)]],
  );
  const plannedPoints = planned.map(({ time, altitude }): [number, number] => [x(time), altitudeY(altitude)]);
  const speedPoints = samples.flatMap(({ time, groundSpeed }): [number, number][] =>
    groundSpeed === null ? [] : [[x(time), speedY(groundSpeed)]],
  );
  const altitudeArea =
    altitudePoints.length > 1
      ? `${linePath(altitudePoints)}L${altitudePoints.at(-1)?.[0].toFixed(1)} ${plotBottom}L${altitudePoints[0][0].toFixed(1)} ${plotBottom}Z`
      : null;

  const { actual } = timesheet;
  const taxiSpans = [
    [actual?.offBlockTime, actual?.takeoffTime],
    [actual?.arrivalTime, actual?.onBlockTime],
  ].flatMap(([from, to]) => (from && to && to > from ? [[x(from.getTime()), x(to.getTime())]] : []));

  const ticks = timeTicks(visible, plotWidth, TICK_SPACING).filter(
    (time) => x(time) - plotLeft > EDGE_CLEARANCE && plotRight - x(time) > EDGE_CLEARANCE,
  );

  const position = cursorIndex === null ? -1 : samples.findIndex((sample) => sample.index === cursorIndex);
  const cursor = position === -1 ? null : samples[position];

  const plotOffset = (event: PointerEvent<HTMLDivElement>) =>
    event.clientX - event.currentTarget.getBoundingClientRect().left - plotLeft;

  const pickAt = (event: PointerEvent<HTMLDivElement>) => {
    const sample = nearestSample(samples, timeAt(plotOffset(event)));

    if (sample !== null && sample.index !== cursorIndex) {
      onCursorChange(sample.index);
    }
  };

  const press = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse") {
      if (event.button === 0 && view !== null && onViewChange !== undefined) {
        event.currentTarget.setPointerCapture(event.pointerId);
        gesture.current = { kind: "drag", pointerId: event.pointerId, originX: event.clientX, view: visible };
        setIsDragging(true);
        return;
      }

      pickAt(event);
      return;
    }

    touches.current.set(event.pointerId, event.clientX);

    if (touches.current.size === 2 && onViewChange !== undefined) {
      const { distance, middle } = touchSpread(touches.current);
      const offset = middle - event.currentTarget.getBoundingClientRect().left - plotLeft;
      gesture.current = { kind: "pinch", distance, span, anchor: timeAt(offset) };
      return;
    }

    pickAt(event);
  };

  const move = (event: PointerEvent<HTMLDivElement>) => {
    const current = gesture.current;

    if (current?.kind === "drag" && current.pointerId === event.pointerId) {
      const shift = (-(event.clientX - current.originX) / plotWidth) * (current.view.end - current.view.start);
      onViewChange?.(panProfile(domain, current.view, shift));
      return;
    }

    if (touches.current.has(event.pointerId)) {
      touches.current.set(event.pointerId, event.clientX);
    }

    if (current?.kind === "pinch") {
      if (touches.current.size >= 2) {
        const { distance, middle } = touchSpread(touches.current);
        const offset = middle - event.currentTarget.getBoundingClientRect().left - plotLeft;
        const ratio = Math.min(Math.max(offset / plotWidth, 0), 1);
        onViewChange?.(placeProfileWindow(domain, current.span * (current.distance / distance), current.anchor, ratio));
      }
      return;
    }

    pickAt(event);
  };

  const release = (event: PointerEvent<HTMLDivElement>) => {
    touches.current.delete(event.pointerId);
    const current = gesture.current;

    if (current?.kind === "drag" && current.pointerId === event.pointerId) {
      gesture.current = null;
      setIsDragging(false);
    }

    if (current?.kind === "pinch" && touches.current.size < 2) {
      gesture.current = null;
    }
  };

  const zoomFromKey = (key: string): boolean => {
    if (onViewChange === undefined) {
      return false;
    }

    const anchor = cursor?.time;

    switch (key) {
      case "+":
      case "=":
        onViewChange(zoomProfile(domain, view, 1 / KEY_ZOOM_FACTOR, anchor));
        return true;
      case "-":
      case "_":
        onViewChange(zoomProfile(domain, view, KEY_ZOOM_FACTOR, anchor));
        return true;
      case "0":
        onViewChange(null);
        return true;
      default:
        return false;
    }
  };

  const step = (event: KeyboardEvent<HTMLDivElement>) => {
    const last = samples.length - 1;
    const current = position === -1 ? (event.key === "ArrowLeft" ? last + 1 : -1) : position;
    const targets: Record<string, number> = {
      ArrowRight: current + 1,
      ArrowUp: current + 1,
      ArrowLeft: current - 1,
      ArrowDown: current - 1,
      PageUp: current + PAGE_STEP,
      PageDown: current - PAGE_STEP,
      Home: 0,
      End: last,
    };

    if (event.key === "Escape") {
      onCursorChange(null);
      return;
    }

    if (zoomFromKey(event.key)) {
      event.preventDefault();
      return;
    }

    const target = targets[event.key];

    if (target === undefined || last < 0) {
      return;
    }

    event.preventDefault();
    const sample = samples[Math.min(Math.max(target, 0), last)];
    onCursorChange(sample.index);

    const revealed = revealInProfile(domain, view, sample.time);
    if (revealed !== view) {
      onViewChange?.(revealed);
    }
  };

  return (
    <div
      ref={ref}
      role="slider"
      tabIndex={0}
      aria-label="Vertical profile"
      aria-valuemin={0}
      aria-valuemax={Math.max(samples.length - 1, 0)}
      aria-valuenow={Math.max(position, 0)}
      aria-valuetext={cursor === null ? "No point selected" : describeSample(cursor)}
      onPointerMove={move}
      onPointerDown={press}
      onPointerUp={release}
      onPointerCancel={release}
      onPointerLeave={(event) => event.pointerType === "mouse" && !isDragging && onCursorChange(null)}
      onKeyDown={step}
      onBlur={() => onCursorChange(null)}
      className={twMerge(
        "relative cursor-crosshair touch-pan-y select-none rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-indigo-400",
        isDragging && "cursor-grabbing",
        className,
      )}
      style={{ height }}
    >
      {width > 0 && (
        <svg width={width} height={height} aria-hidden={true} className="block overflow-visible font-mono">
          <defs>
            <clipPath id={clipId}>
              <rect x={plotLeft} y={0} width={plotWidth} height={plotBottom + 1} />
            </clipPath>
          </defs>
          <g clipPath={`url(#${clipId})`}>
            {taxiSpans.map(([from, to]) => (
              <rect
                key={from}
                x={from}
                y={TOP_PADDING}
                width={to - from}
                height={plotHeight}
                className="fill-gray-100 dark:fill-gray-800/70"
              />
            ))}
          </g>
          {altitudeTicks(domain.ceiling).map((altitude) => (
            <g key={altitude}>
              <line
                x1={plotLeft}
                x2={plotRight}
                y1={altitudeY(altitude)}
                y2={altitudeY(altitude)}
                className="stroke-gray-200 dark:stroke-gray-800"
              />
              <text
                x={plotLeft - 6}
                y={altitudeY(altitude)}
                dy="0.32em"
                textAnchor="end"
                className="fill-gray-500 text-xs dark:fill-gray-400"
              >
                {formatFlightLevel(altitude)}
              </text>
            </g>
          ))}
          <text
            x={plotRight + 6}
            y={speedY(domain.topSpeed)}
            dy="0.32em"
            className="fill-gray-500 text-xs dark:fill-gray-400"
          >
            {domain.topSpeed} kt
          </text>
          <line
            x1={plotLeft}
            x2={plotRight}
            y1={plotBottom}
            y2={plotBottom}
            className="stroke-gray-300 dark:stroke-gray-700"
          />
          <g clipPath={`url(#${clipId})`}>
            {altitudeArea !== null && <path d={altitudeArea} className="fill-indigo-500/12 dark:fill-indigo-400/15" />}
            {speedPoints.length > 1 && (
              <path
                d={linePath(speedPoints)}
                fill="none"
                strokeWidth={1.5}
                strokeLinejoin="round"
                className="stroke-gray-500 dark:stroke-gray-400"
              />
            )}
            {plannedPoints.length > 1 && (
              <path
                d={linePath(plannedPoints)}
                fill="none"
                strokeWidth={1.5}
                strokeDasharray="5 4"
                strokeLinejoin="round"
                className="stroke-indigo-400 dark:stroke-indigo-300"
              />
            )}
            {altitudePoints.length > 1 && (
              <path
                d={linePath(altitudePoints)}
                fill="none"
                strokeWidth={2}
                strokeLinejoin="round"
                className="stroke-indigo-500 dark:stroke-indigo-400"
              />
            )}
          </g>
          <text x={plotLeft} y={height - 3} className="fill-gray-700 text-xs dark:fill-gray-300">
            {dateToIcaoTime(new Date(visible.start))}Z
          </text>
          {ticks.map((time) => (
            <g key={time}>
              <line
                x1={x(time)}
                x2={x(time)}
                y1={plotBottom}
                y2={plotBottom + 4}
                className="stroke-gray-300 dark:stroke-gray-700"
              />
              <text x={x(time)} y={height - 3} textAnchor="middle" className="fill-gray-500 text-xs dark:fill-gray-400">
                {dateToIcaoTime(new Date(time))}Z
              </text>
            </g>
          ))}
          <text x={plotRight} y={height - 3} textAnchor="end" className="fill-gray-700 text-xs dark:fill-gray-300">
            {dateToIcaoTime(new Date(visible.end))}Z
          </text>
          {cursor !== null && (
            <g clipPath={`url(#${clipId})`}>
              <line
                x1={x(cursor.time)}
                x2={x(cursor.time)}
                y1={TOP_PADDING}
                y2={plotBottom}
                strokeWidth={1.5}
                className="stroke-gray-900 dark:stroke-white"
              />
              {cursor.altitude !== null && (
                <circle
                  cx={x(cursor.time)}
                  cy={altitudeY(cursor.altitude)}
                  r={4}
                  strokeWidth={2}
                  className="fill-white stroke-indigo-600 dark:fill-gray-900 dark:stroke-indigo-400"
                />
              )}
            </g>
          )}
        </svg>
      )}
    </div>
  );
}
