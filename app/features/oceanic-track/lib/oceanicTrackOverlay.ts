import type { LatLngTuple } from "leaflet";
import type { ExpressionSpecification, LayerSpecification } from "maplibre-gl";
import type { FlightDataDisplay } from "~/app-state/useMapSettings";
import { trackArrows } from "~/features/oceanic-track/lib/trackArrows";
import type { OceanicTrack, OceanicTrackFix, OceanicTrackSystem } from "~/features/oceanic-track/model";
import { OceanicDirection } from "~/features/route/model";
import { emphasisOf } from "~/shared/lib/flightData";
import { type GlobeOverlay, type GlobePoint, lineSource, pointSource } from "~/shared/lib/globeStyle";
import { greatCirclePath } from "~/shared/lib/greatCircle";
import type { BasemapTheme } from "~/shared/lib/versatilesBasemap";

export const OCEANIC_TRACK_LINES_SOURCE = "oceanic-track-lines";
export const OCEANIC_TRACK_FIXES_SOURCE = "oceanic-track-fixes";
export const OCEANIC_TRACK_ARROWS_SOURCE = "oceanic-track-arrows";

const LINE_OPACITY = 0.9;
const LABEL_SPACING = 360;
const ARROW = "›";
const ARROW_TIERS: { rank: number; minzoom?: number }[] = [
  { rank: 0 },
  { rank: 1, minzoom: 3 },
  { rank: 2, minzoom: 4.5 },
];
const FIX_MIN_ZOOM = 3;
const FIX_NAME_MIN_ZOOM = 4.5;

type Palette = {
  tracks: Record<OceanicDirection, { line: string; label: string }>;
  fix: string;
  fixName: string;
  halo: string;
};

const palette: Record<BasemapTheme, Palette> = {
  light: {
    tracks: {
      [OceanicDirection.West]: { line: "#d97706", label: "#b45309" },
      [OceanicDirection.East]: { line: "#0d9488", label: "#0f766e" },
    },
    fix: "#6b7280",
    fixName: "#374151",
    halo: "#f9fafb",
  },
  dark: {
    tracks: {
      [OceanicDirection.West]: { line: "#e3a857", label: "#ecc07f" },
      [OceanicDirection.East]: { line: "#5cbfb3", label: "#86d3c9" },
    },
    fix: "#9ca3af",
    fixName: "#d1d5db",
    halo: "#030712",
  },
};

const NO_OVERLAY: GlobeOverlay = { sources: {}, layers: [] };

export type OceanicTrackDisplays = Record<OceanicTrackSystem, FlightDataDisplay>;

const emphasis: ExpressionSpecification = ["get", "emphasis"];

const SHOWN: (FlightDataDisplay | undefined)[] = ["show", "dim"];

const lineWidth: ExpressionSpecification = ["interpolate", ["linear"], ["zoom"], 2, 1.4, 6, 2, 10, 2.6];

const fixRadius: ExpressionSpecification = ["interpolate", ["linear"], ["zoom"], FIX_MIN_ZOOM, 2, 8, 3.5];

export function oceanicTrackColor(direction: OceanicDirection, theme: BasemapTheme): string {
  return palette[theme].tracks[direction].line;
}

function byDirection(theme: BasemapTheme, shade: "line" | "label"): ExpressionSpecification {
  const { tracks } = palette[theme];

  return [
    "match",
    ["get", "direction"],
    OceanicDirection.West,
    tracks[OceanicDirection.West][shade],
    tracks[OceanicDirection.East][shade],
  ];
}

function position({ latitude, longitude }: OceanicTrackFix): LatLngTuple {
  return [latitude, longitude];
}

function uniqueFixes(tracks: OceanicTrack[], displays: OceanicTrackDisplays): GlobePoint[] {
  const fixes = new Map<string, GlobePoint>();

  for (const track of tracks) {
    for (const fix of track.fixes) {
      const key = `${fix.ident}:${fix.latitude.toFixed(3)}:${fix.longitude.toFixed(3)}`;

      if (!fixes.has(key)) {
        fixes.set(key, {
          position: position(fix),
          properties: { name: fix.ident, emphasis: emphasisOf(displays[track.system]) },
        });
      }
    }
  }

  return [...fixes.values()];
}

function trackLine(theme: BasemapTheme): LayerSpecification {
  return {
    id: "oceanic-track-line",
    type: "line",
    source: OCEANIC_TRACK_LINES_SOURCE,
    layout: { "line-join": "round", "line-cap": "round" },
    paint: {
      "line-color": byDirection(theme, "line"),
      "line-width": lineWidth,
      "line-opacity": ["*", LINE_OPACITY, emphasis],
    },
  };
}

function trackName(theme: BasemapTheme): LayerSpecification {
  return {
    id: "oceanic-track-name",
    type: "symbol",
    source: OCEANIC_TRACK_LINES_SOURCE,
    layout: {
      "symbol-placement": "line",
      "symbol-spacing": LABEL_SPACING,
      "text-field": ["get", "identifier"],
      "text-font": ["noto_sans_bold"],
      "text-size": 15,
      "text-rotation-alignment": "viewport",
      "text-pitch-alignment": "viewport",
      "text-padding": 4,
    },
    paint: {
      "text-color": byDirection(theme, "label"),
      "text-opacity": emphasis,
      "text-halo-color": palette[theme].halo,
      "text-halo-width": 2.5,
    },
  };
}

function arrowLayers(theme: BasemapTheme): LayerSpecification[] {
  return ARROW_TIERS.map(({ rank, minzoom }) => ({
    id: `oceanic-track-arrow-${rank}`,
    type: "symbol",
    source: OCEANIC_TRACK_ARROWS_SOURCE,
    ...(minzoom === undefined ? {} : { minzoom }),
    filter: ["==", ["get", "rank"], rank],
    layout: {
      "text-field": ARROW,
      "text-font": ["noto_sans_bold"],
      "text-size": 20,
      "text-rotate": ["get", "rotate"],
      "text-rotation-alignment": "map",
      "text-pitch-alignment": "map",
      "text-allow-overlap": true,
      "text-ignore-placement": true,
    },
    paint: {
      "text-color": byDirection(theme, "line"),
      "text-opacity": emphasis,
      "text-halo-color": palette[theme].halo,
      "text-halo-width": 1.25,
    },
  }));
}

function fixDot(theme: BasemapTheme): LayerSpecification {
  const colors = palette[theme];

  return {
    id: "oceanic-track-fix",
    type: "circle",
    source: OCEANIC_TRACK_FIXES_SOURCE,
    minzoom: FIX_MIN_ZOOM,
    paint: {
      "circle-radius": fixRadius,
      "circle-color": colors.fix,
      "circle-opacity": emphasis,
      "circle-stroke-color": colors.halo,
      "circle-stroke-width": 1.25,
      "circle-stroke-opacity": emphasis,
    },
  };
}

function fixName(theme: BasemapTheme): LayerSpecification {
  const colors = palette[theme];

  return {
    id: "oceanic-track-fix-name",
    type: "symbol",
    source: OCEANIC_TRACK_FIXES_SOURCE,
    minzoom: FIX_NAME_MIN_ZOOM,
    layout: {
      "text-field": ["get", "name"],
      "text-font": ["noto_sans_regular"],
      "text-size": 12,
      "text-anchor": "top",
      "text-offset": [0, 0.7],
      "text-padding": 2,
    },
    paint: {
      "text-color": colors.fixName,
      "text-opacity": emphasis,
      "text-halo-color": colors.halo,
      "text-halo-width": 1.5,
    },
  };
}

export function showsOceanicTracks(displays: OceanicTrackDisplays): boolean {
  return Object.values(displays).some((display) => display !== "hide");
}

export function oceanicTrackOverlay(
  displays: OceanicTrackDisplays,
  theme: BasemapTheme,
  tracks: OceanicTrack[],
): GlobeOverlay {
  const shown = tracks.filter((track) => SHOWN.includes(displays[track.system]));

  if (shown.length === 0) {
    return NO_OVERLAY;
  }

  const lines = shown.map((track) => ({
    path: greatCirclePath(track.fixes.map(position)),
    properties: {
      identifier: track.identifier,
      direction: track.direction,
      emphasis: emphasisOf(displays[track.system]),
    },
  }));

  return {
    sources: {
      [OCEANIC_TRACK_LINES_SOURCE]: lineSource(lines),
      [OCEANIC_TRACK_ARROWS_SOURCE]: pointSource(
        lines.flatMap(({ path, properties }) =>
          trackArrows(path, { direction: properties.direction, emphasis: properties.emphasis }),
        ),
      ),
      [OCEANIC_TRACK_FIXES_SOURCE]: pointSource(uniqueFixes(shown, displays)),
    },
    layers: [trackLine(theme), ...arrowLayers(theme), fixDot(theme), trackName(theme), fixName(theme)],
  };
}
