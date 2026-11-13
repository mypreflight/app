import type { LatLngTuple } from "leaflet";
import { initialBearing } from "~/features/runway/lib/runwayPairs";
import type { GlobePoint } from "~/shared/lib/globeStyle";

export const ARROW_INTERVAL_NM = 150;

const EARTH_RADIUS_NM = 3440.065;
const GLYPH_HEADING = 90;
const RANKS = 4;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function distanceNm([fromLat, fromLng]: LatLngTuple, [toLat, toLng]: LatLngTuple): number {
  const dLat = toRadians(toLat - fromLat);
  const dLng = toRadians(toLng - fromLng);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(fromLat)) * Math.cos(toRadians(toLat)) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_NM * Math.asin(Math.min(1, Math.sqrt(a)));
}

function rankOf(index: number): number {
  if (index % RANKS === 0) {
    return 0;
  }

  return index % 2 === 0 ? 1 : 2;
}

export function trackArrows(path: LatLngTuple[], properties: Record<string, string | number>): GlobePoint[] {
  const arrows: GlobePoint[] = [];
  let travelled = 0;
  let next = ARROW_INTERVAL_NM / 2;

  for (let index = 1; index < path.length; index++) {
    const from = path[index - 1];
    const to = path[index];
    const length = distanceNm(from, to);

    while (length > 0 && travelled + length >= next) {
      const fraction = (next - travelled) / length;
      const position: LatLngTuple = [from[0] + (to[0] - from[0]) * fraction, from[1] + (to[1] - from[1]) * fraction];
      const heading = initialBearing(from[0], from[1], to[0], to[1]);

      arrows.push({
        position,
        properties: { ...properties, rotate: heading - GLYPH_HEADING, rank: rankOf(arrows.length) },
      });
      next += ARROW_INTERVAL_NM;
    }

    travelled += length;
  }

  return arrows;
}
