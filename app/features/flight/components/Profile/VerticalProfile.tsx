import React, { type KeyboardEvent, type PointerEvent, useMemo } from "react";
import { twMerge } from "tailwind-merge";
import type { FlightPathElement, Timesheet } from "~/features/flight";
import {
  altitudeTicks,
  formatFlightLevel,
  nearestSample,
  type PlannedPoint,
  type ProfileSample,
  profileDomain,
  profileSamples,
  timeTicks,
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

type Props = {
  path: FlightPathElement[];
  timesheet: Timesheet;
  planned?: PlannedPoint[];
  cursorIndex: number | null;
  onCursorChange: (index: number | null) => void;
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

export function VerticalProfile({
  path,
  timesheet,
  planned = NO_PLAN,
  cursorIndex,
  onCursorChange,
  plotHeight = 88,
  className,
}: Props) {
  const { ref, width } = useElementSize<HTMLDivElement>();
  const samples = useMemo(() => profileSamples(path), [path]);
  const domain = useMemo(() => profileDomain(samples, timesheet, planned), [samples, timesheet, planned]);

  const plotLeft = LEFT_GUTTER;
  const plotRight = Math.max(plotLeft + 1, width - RIGHT_GUTTER);
  const plotBottom = TOP_PADDING + plotHeight;
  const height = plotBottom + AXIS_HEIGHT;

  const x = (time: number) => plotLeft + ((time - domain.start) / (domain.end - domain.start)) * (plotRight - plotLeft);
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

  const plotWidth = plotRight - plotLeft;
  const ticks = timeTicks(domain, plotWidth, TICK_SPACING).filter(
    (time) => x(time) - plotLeft > EDGE_CLEARANCE && plotRight - x(time) > EDGE_CLEARANCE,
  );

  const position = cursorIndex === null ? -1 : samples.findIndex((sample) => sample.index === cursorIndex);
  const cursor = position === -1 ? null : samples[position];

  const pickAt = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const offset = Math.min(Math.max(event.clientX - bounds.left, plotLeft), plotRight);
    const time = domain.start + ((offset - plotLeft) / plotWidth) * (domain.end - domain.start);
    const sample = nearestSample(samples, time);

    if (sample !== null && sample.index !== cursorIndex) {
      onCursorChange(sample.index);
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

    const target = targets[event.key];

    if (target === undefined || last < 0) {
      return;
    }

    event.preventDefault();
    onCursorChange(samples[Math.min(Math.max(target, 0), last)].index);
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
      onPointerMove={pickAt}
      onPointerDown={pickAt}
      onPointerLeave={(event) => event.pointerType === "mouse" && onCursorChange(null)}
      onKeyDown={step}
      onBlur={() => onCursorChange(null)}
      className={twMerge(
        "relative cursor-crosshair touch-pan-y select-none rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-indigo-400",
        className,
      )}
      style={{ height }}
    >
      {width > 0 && (
        <svg width={width} height={height} aria-hidden={true} className="block overflow-visible font-mono">
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
                className="fill-gray-500 text-2xs dark:fill-gray-400"
              >
                {formatFlightLevel(altitude)}
              </text>
            </g>
          ))}
          <text
            x={plotRight + 6}
            y={speedY(domain.topSpeed)}
            dy="0.32em"
            className="fill-gray-500 text-2xs dark:fill-gray-400"
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
          <text x={plotLeft} y={height - 3} className="fill-gray-700 text-2xs dark:fill-gray-300">
            {dateToIcaoTime(new Date(domain.start))}Z
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
              <text
                x={x(time)}
                y={height - 3}
                textAnchor="middle"
                className="fill-gray-500 text-2xs dark:fill-gray-400"
              >
                {dateToIcaoTime(new Date(time))}Z
              </text>
            </g>
          ))}
          <text x={plotRight} y={height - 3} textAnchor="end" className="fill-gray-700 text-2xs dark:fill-gray-300">
            {dateToIcaoTime(new Date(domain.end))}Z
          </text>
          {cursor !== null && (
            <g>
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
