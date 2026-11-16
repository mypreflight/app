import type { FlightPathElement, Timesheet } from "~/features/flight/model";

export type ProfileSample = {
  index: number;
  time: number;
  altitude: number | null;
  groundSpeed: number | null;
};

export type ProfileDomain = {
  start: number;
  end: number;
  ceiling: number;
  topSpeed: number;
};

export type PlannedPoint = {
  time: number;
  altitude: number;
};

export type ProfileWindow = {
  start: number;
  end: number;
};

export type ProfileExtremes = {
  altitude: number | null;
  groundSpeed: number | null;
};

const MINUTE = 60_000;
const ALTITUDE_STEP = 5_000;
const SPEED_STEP = 100;
const TIME_STEPS_MINUTES = [1, 2, 5, 10, 15, 30, 60, 120, 180, 240, 360];
const SHORTEST_WINDOW = 5 * MINUTE;

function valueOrNull(value: number | undefined): number | null {
  return value === undefined || Number.isNaN(value) ? null : value;
}

function roundUp(value: number, step: number): number {
  return Math.max(step, Math.ceil(value / step) * step);
}

export function profileSamples(path: FlightPathElement[]): ProfileSample[] {
  return path
    .map((point, index) => ({
      index,
      time: new Date(point.date).getTime(),
      altitude: valueOrNull(point.isOnGround ? 0 : point.altitude),
      groundSpeed: valueOrNull(point.groundSpeed),
    }))
    .filter((sample) => !Number.isNaN(sample.time))
    .sort((a, b) => a.time - b.time);
}

export function profileExtremes(samples: ProfileSample[]): ProfileExtremes {
  const altitudes = samples.flatMap(({ altitude }) => (altitude === null ? [] : [altitude]));
  const speeds = samples.flatMap(({ groundSpeed }) => (groundSpeed === null ? [] : [groundSpeed]));

  return {
    altitude: altitudes.length === 0 ? null : Math.max(...altitudes),
    groundSpeed: speeds.length === 0 ? null : Math.max(...speeds),
  };
}

export function plannedProfile(
  fixes: { altitude: number; elapsedSeconds: number }[],
  takeoff: Date | null | undefined,
): PlannedPoint[] {
  if (!takeoff || fixes.length < 2) {
    return [];
  }

  return fixes.map(({ altitude, elapsedSeconds }) => ({
    time: takeoff.getTime() + elapsedSeconds * 1000,
    altitude,
  }));
}

export function profileDomain(
  samples: ProfileSample[],
  timesheet: Timesheet,
  planned: PlannedPoint[] = [],
): ProfileDomain {
  const times = [...samples.map(({ time }) => time), ...planned.map(({ time }) => time)];
  const offBlock = timesheet.actual?.offBlockTime?.getTime() ?? Number.POSITIVE_INFINITY;
  const onBlock = timesheet.actual?.onBlockTime?.getTime() ?? Number.NEGATIVE_INFINITY;
  const start = Math.min(offBlock, ...times);
  const end = Math.max(onBlock, ...times);
  const extremes = profileExtremes(samples);
  const plannedCeiling = Math.max(0, ...planned.map(({ altitude }) => altitude));

  return {
    start,
    end: end > start ? end : start + MINUTE,
    ceiling: roundUp(Math.max(extremes.altitude ?? 0, plannedCeiling), ALTITUDE_STEP),
    topSpeed: roundUp(extremes.groundSpeed ?? 0, SPEED_STEP),
  };
}

export function profileWindow(domain: ProfileWindow, view: ProfileWindow | null): ProfileWindow {
  if (view === null) {
    return { start: domain.start, end: domain.end };
  }

  const span = Math.min(view.end - view.start, domain.end - domain.start);
  const start = Math.min(Math.max(view.start, domain.start), domain.end - span);

  return { start, end: start + span };
}

export function placeProfileWindow(
  domain: ProfileWindow,
  span: number,
  anchor: number,
  anchorRatio: number,
): ProfileWindow | null {
  const full = domain.end - domain.start;
  const fitted = Math.min(Math.max(span, Math.min(SHORTEST_WINDOW, full)), full);

  if (fitted >= full) {
    return null;
  }

  const start = anchor - anchorRatio * fitted;

  return profileWindow(domain, { start, end: start + fitted });
}

export function zoomProfile(
  domain: ProfileWindow,
  view: ProfileWindow | null,
  factor: number,
  anchor?: number,
): ProfileWindow | null {
  const current = profileWindow(domain, view);
  const span = current.end - current.start;
  const center = anchor ?? current.start + span / 2;

  return placeProfileWindow(domain, span * factor, center, (center - current.start) / span);
}

export function panProfile(domain: ProfileWindow, view: ProfileWindow | null, shift: number): ProfileWindow | null {
  if (view === null) {
    return null;
  }

  const current = profileWindow(domain, view);

  return profileWindow(domain, { start: current.start + shift, end: current.end + shift });
}

export function revealInProfile(domain: ProfileWindow, view: ProfileWindow | null, time: number): ProfileWindow | null {
  const current = profileWindow(domain, view);

  if (view === null || (time >= current.start && time <= current.end)) {
    return view;
  }

  const shift = time < current.start ? time - current.start : time - current.end;

  return panProfile(domain, view, shift);
}

export function nearestSample(samples: ProfileSample[], time: number): ProfileSample | null {
  if (samples.length === 0) {
    return null;
  }

  let low = 0;
  let high = samples.length - 1;

  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (samples[middle].time < time) {
      low = middle + 1;
    } else {
      high = middle;
    }
  }

  const after = samples[low];
  const before = samples[low - 1];

  return before !== undefined && time - before.time < after.time - time ? before : after;
}

export function altitudeTicks(ceiling: number): number[] {
  const step = ceiling > 20_000 ? 10_000 : ALTITUDE_STEP;
  const ticks: number[] = [];

  for (let altitude = step; altitude <= ceiling; altitude += step) {
    ticks.push(altitude);
  }

  return ticks;
}

export function timeTicks(domain: ProfileWindow, width: number, minSpacing: number): number[] {
  const minutes = (domain.end - domain.start) / MINUTE;
  const step =
    TIME_STEPS_MINUTES.find((candidate) => (candidate / minutes) * width >= minSpacing) ?? TIME_STEPS_MINUTES.at(-1);

  if (step === undefined || width <= 0) {
    return [];
  }

  const stepMs = step * MINUTE;
  const ticks: number[] = [];

  for (let time = Math.ceil(domain.start / stepMs) * stepMs; time <= domain.end; time += stepMs) {
    ticks.push(time);
  }

  return ticks;
}

export function formatFlightLevel(altitude: number): string {
  return `FL${String(Math.round(altitude / 100)).padStart(3, "0")}`;
}
