import type { Diversion } from "~/features/diversion";
import type { Flight, FlightPathElement } from "~/features/flight";
import { FlightGlobeMap } from "~/features/flight/components/Map/Box/FlightGlobeMap";
import { useAuthorizedLayoutServices } from "~/features/flight/hooks/useAirportLayoutData";
import { usePlannedRoute } from "~/features/route/hooks/useRouteBriefing";
import type { GlobeInsets } from "~/shared/lib/globeCamera";
import type { MapCameraView } from "~/shared/lib/mapCameraView";
import type { MapFocus } from "~/shared/lib/mapFocus";

type Props = {
  flight: Flight;
  diversion: Diversion | null;
  flightPath: FlightPathElement[];
  aircraftPath?: FlightPathElement[];
  insets: GlobeInsets;
  initialView: MapCameraView | null;
  onViewChange: (view: MapCameraView) => void;
  onFixClick: (ordinal: number) => void;
  focus: MapFocus | null;
};

export function FlightRouteGlobeMap({
  flight,
  diversion,
  flightPath,
  aircraftPath,
  insets,
  initialView,
  onViewChange,
  onFixClick,
  focus,
}: Props) {
  const plannedRoute = usePlannedRoute();
  const layoutServices = useAuthorizedLayoutServices();

  return (
    <FlightGlobeMap
      flight={flight}
      diversion={diversion}
      flightPath={flightPath}
      aircraftPath={aircraftPath}
      plannedRoute={plannedRoute}
      layoutServices={layoutServices}
      insets={insets}
      initialView={initialView}
      onViewChange={onViewChange}
      onFixClick={onFixClick}
      focus={focus}
      withAirspace={true}
    />
  );
}
