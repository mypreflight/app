import { useThemeMode } from "flowbite-react";
import type { LatLngTuple } from "leaflet";
import React, { useMemo } from "react";
import type { Airport } from "~/features/airport";
import { airportLayoutGlobeMarkers } from "~/features/flight/components/Map/Globe/globeMarkers";
import { cameraOver, framedSpan, type PickerCamera } from "~/features/flight/components/Modal/pickerCamera";
import { type GlobeAirportScene, globeAirportOverlay, type RunwayUse } from "~/features/flight/lib/globeAirportOverlay";
import type { Runway } from "~/features/runway";
import { computeRunwayRibbons } from "~/features/runway/lib/runwayPairs";
import type { Terminal } from "~/features/terminal";
import { useElementSize } from "~/shared/hooks/useElementSize";
import type { GlobeInsets } from "~/shared/lib/globeCamera";
import type { GlobeOverlay } from "~/shared/lib/globeStyle";
import type { GlobeCameraTarget } from "~/shared/ui/Globe/GlobeMap";
import { LazyGlobeMap } from "~/shared/ui/Globe/LazyGlobeMap";

type Props = {
  airport: Airport;
  use: RunwayUse;
  runways: Runway[];
  terminals: Terminal[];
  selectedId: string | null;
  onPick: (runwayId: string) => void;
};

const NO_INSETS: GlobeInsets = { top: 0, bottom: 0 };
const RUNWAY_FIT_ZOOM = 15;
const MAX_RUNWAY_ZOOM = 17;
const ALWAYS_SHOWN_LAYERS = new Set(["airport-runway-casing", "airport-runway-surface"]);

function withRunwaysAtEveryZoom(overlay: GlobeOverlay): GlobeOverlay {
  return {
    ...overlay,
    layers: overlay.layers.map((layer) => (ALWAYS_SHOWN_LAYERS.has(layer.id) ? { ...layer, minzoom: 0 } : layer)),
  };
}

const RUNWAY_FRAMING = { minSpanM: 1500, maxZoom: RUNWAY_FIT_ZOOM };

function runwayCamera(airport: Airport, runways: Runway[], framedSpanPx: number): PickerCamera {
  const ends = computeRunwayRibbons(runways).flatMap((ribbon): LatLngTuple[] => ribbon.centerline);

  return cameraOver(ends, [airport.location.latitude, airport.location.longitude], {
    ...RUNWAY_FRAMING,
    framedSpanPx,
  });
}

export function RunwayPickerMap({ airport, use, runways, terminals, selectedId, onPick }: Props) {
  const { computedMode } = useThemeMode();
  const { ref, width, height } = useElementSize<HTMLDivElement>();
  const framedSpanPx = framedSpan(width, height);

  const scenes = useMemo(
    (): GlobeAirportScene[] => [
      {
        airport,
        runways,
        assignedRunwayId: selectedId,
        assignedRunwayUse: use,
        terminals,
        gates: [],
        parkingPositions: [],
        assignedParkingPositionId: null,
      },
    ],
    [airport, use, runways, terminals, selectedId],
  );

  const overlay = useMemo(
    () => withRunwaysAtEveryZoom(globeAirportOverlay(scenes, computedMode)),
    [scenes, computedMode],
  );
  const markers = useMemo(() => airportLayoutGlobeMarkers(scenes, { onRunwayPick: onPick }), [scenes, onPick]);
  const target = useMemo((): GlobeCameraTarget => {
    const { centre, zoom } = runwayCamera(airport, runways, framedSpanPx);

    return { key: `runways-${airport.id}`, kind: "point", position: centre, zoom };
  }, [airport, runways, framedSpanPx]);

  return (
    <div
      ref={ref}
      className="relative order-first h-64 min-w-0 overflow-hidden rounded-xl border border-gray-200 md:order-none md:h-auto md:min-h-136 dark:border-gray-800"
    >
      <LazyGlobeMap overlay={overlay} target={target} insets={NO_INSETS} markers={markers} maxZoom={MAX_RUNWAY_ZOOM} />
    </div>
  );
}
