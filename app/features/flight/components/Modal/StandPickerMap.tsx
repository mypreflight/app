import { useThemeMode } from "flowbite-react";
import type { LatLngTuple } from "leaflet";
import React, { useMemo } from "react";
import type { Airport } from "~/features/airport";
import { airportLayoutGlobeMarkers } from "~/features/flight/components/Map/Globe/globeMarkers";
import { cameraOver, framedSpan } from "~/features/flight/components/Modal/pickerCamera";
import { type GlobeAirportScene, globeAirportOverlay } from "~/features/flight/lib/globeAirportOverlay";
import type { ParkingPosition } from "~/features/parking-position";
import type { Runway } from "~/features/runway";
import type { Terminal } from "~/features/terminal";
import { useElementSize } from "~/shared/hooks/useElementSize";
import type { GlobeInsets } from "~/shared/lib/globeCamera";
import type { GlobeCameraTarget } from "~/shared/ui/Globe/GlobeMap";
import { LazyGlobeMap } from "~/shared/ui/Globe/LazyGlobeMap";

type Props = {
  airport: Airport;
  parkingPositions: ParkingPosition[];
  runways: Runway[];
  terminals: Terminal[];
  selectedId: string | null;
  focusId: string | null;
  hiddenOnPhone: boolean;
  onPick: (parkingPositionId: string) => void;
};

const NO_INSETS: GlobeInsets = { top: 0, bottom: 0 };
const STAND_ZOOM = 16.5;
const MAX_STAND_ZOOM = 19;
const STANDS_FRAMING = { minSpanM: 600, maxZoom: STAND_ZOOM };

function standPosition(parkingPosition: ParkingPosition | undefined): LatLngTuple | null {
  return parkingPosition?.coordinates
    ? [parkingPosition.coordinates.latitude, parkingPosition.coordinates.longitude]
    : null;
}

export function StandPickerMap({
  airport,
  parkingPositions,
  runways,
  terminals,
  selectedId,
  focusId,
  hiddenOnPhone,
  onPick,
}: Props) {
  const { computedMode } = useThemeMode();
  const { ref, width, height } = useElementSize<HTMLDivElement>();
  const framedSpanPx = framedSpan(width, height);

  const scenes = useMemo(
    (): GlobeAirportScene[] => [
      {
        airport,
        runways,
        assignedRunwayId: null,
        terminals,
        gates: [],
        parkingPositions,
        assignedParkingPositionId: selectedId,
      },
    ],
    [airport, runways, terminals, parkingPositions, selectedId],
  );

  const overlay = useMemo(() => globeAirportOverlay(scenes, computedMode), [scenes, computedMode]);
  const markers = useMemo(() => airportLayoutGlobeMarkers(scenes, { onParkingPositionPick: onPick }), [scenes, onPick]);

  const target = useMemo((): GlobeCameraTarget => {
    const focused = standPosition(parkingPositions.find((parkingPosition) => parkingPosition.id === focusId));
    if (focused !== null) {
      return { key: `stand-${focusId}`, kind: "point", position: focused, zoom: STAND_ZOOM };
    }

    const placed = parkingPositions.map(standPosition).filter((position) => position !== null);
    const { centre, zoom } = cameraOver(placed, [airport.location.latitude, airport.location.longitude], {
      ...STANDS_FRAMING,
      framedSpanPx,
    });

    return { key: `stands-${airport.id}`, kind: "point", position: centre, zoom };
  }, [airport, parkingPositions, focusId, framedSpanPx]);

  return (
    <div
      ref={ref}
      className={`relative h-64 min-w-0 overflow-hidden rounded-xl border border-gray-200 md:col-start-2 md:row-span-2 md:row-start-1 md:h-auto md:min-h-136 dark:border-gray-800 ${hiddenOnPhone ? "max-md:hidden" : ""}`}
    >
      <LazyGlobeMap overlay={overlay} target={target} insets={NO_INSETS} markers={markers} maxZoom={MAX_STAND_ZOOM} />
    </div>
  );
}
