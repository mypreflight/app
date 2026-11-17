import { useEffect, useState } from "react";
import type { Runway } from "~/features/runway/model";
import { useApi } from "~/shared/api/useApi";

export function useRunwayDesignators(airportId: string | null): Map<string, string> | null {
  const { runwayService } = useApi();
  const [designators, setDesignators] = useState<Map<string, string> | null>(null);

  useEffect(() => {
    if (airportId === null) {
      return;
    }

    let cancelled = false;
    setDesignators(null);

    (runwayService.fetchAll(airportId) as Promise<Runway[]>)
      .then((runways) => {
        if (!cancelled) {
          setDesignators(new Map(runways.map((runway) => [runway.id, runway.designator])));
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [airportId, runwayService]);

  return designators;
}
