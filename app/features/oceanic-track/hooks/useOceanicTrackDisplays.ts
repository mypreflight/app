import { useMemo } from "react";
import { useMapSettings } from "~/app-state/useMapSettings";
import type { OceanicTrackDisplays } from "~/features/oceanic-track/lib/oceanicTrackOverlay";
import { OceanicTrackSystem } from "~/features/oceanic-track/model";

export function useOceanicTrackDisplays(withAirspace: boolean): OceanicTrackDisplays {
  const { mapSettings } = useMapSettings();
  const nat = withAirspace ? mapSettings.natDisplay : "hide";
  const pacots = withAirspace ? mapSettings.pacotsDisplay : "hide";

  return useMemo(() => ({ [OceanicTrackSystem.Nat]: nat, [OceanicTrackSystem.Pacots]: pacots }), [nat, pacots]);
}
