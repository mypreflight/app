import type { LatLngTuple } from "leaflet";

const EARTH_CIRCUMFERENCE_M = 40_075_016;
const TILE_SIZE = 512;
const METRES_PER_DEGREE = EARTH_CIRCUMFERENCE_M / 360;
const FRAME_MARGIN_PX = 64;
const MIN_FRAMED_SPAN_PX = 160;
const UNMEASURED_SPAN_PX = 460;

type Framing = {
  framedSpanPx: number;
  minSpanM: number;
  maxZoom: number;
};

export type PickerCamera = {
  centre: LatLngTuple;
  zoom: number;
};

export function framedSpan(width: number, height: number): number {
  if (width === 0 || height === 0) {
    return UNMEASURED_SPAN_PX;
  }

  return Math.max(Math.min(width, height) - FRAME_MARGIN_PX, MIN_FRAMED_SPAN_PX);
}

export function cameraOver(points: LatLngTuple[], fallback: LatLngTuple, framing: Framing): PickerCamera {
  if (points.length === 0) {
    return { centre: fallback, zoom: framing.maxZoom };
  }

  const latitudes = points.map(([latitude]) => latitude);
  const longitudes = points.map(([, longitude]) => longitude);
  const centre: LatLngTuple = [
    (Math.min(...latitudes) + Math.max(...latitudes)) / 2,
    (Math.min(...longitudes) + Math.max(...longitudes)) / 2,
  ];
  const latitudeScale = Math.cos((centre[0] * Math.PI) / 180);
  const span = Math.max(
    (Math.max(...latitudes) - Math.min(...latitudes)) * METRES_PER_DEGREE,
    (Math.max(...longitudes) - Math.min(...longitudes)) * METRES_PER_DEGREE * latitudeScale,
    framing.minSpanM,
  );
  const zoom = Math.log2((framing.framedSpanPx * EARTH_CIRCUMFERENCE_M * latitudeScale) / (TILE_SIZE * span));

  return { centre, zoom: Math.min(zoom, framing.maxZoom) };
}
