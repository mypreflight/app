import { useEffect, useMemo, useState } from "react";
import { nextValidityChange, tracksInForce } from "~/features/oceanic-track/lib/tracksInForce";
import type { OceanicTrack } from "~/features/oceanic-track/model";
import type { PublicOceanicTrackService } from "~/features/oceanic-track/service";
import { usePublicApi } from "~/shared/api/usePublicApi";

const REFRESH_MS = 15 * 60 * 1000;

const NO_TRACKS: OceanicTrack[] = [];

let loaded: { tracks: OceanicTrack[]; at: number } | null = null;
let pending: Promise<OceanicTrack[]> | null = null;

function loadTracks(service: PublicOceanicTrackService): Promise<OceanicTrack[]> {
  if (loaded !== null && Date.now() - loaded.at < REFRESH_MS) {
    return Promise.resolve(loaded.tracks);
  }

  pending ??= service
    .fetchCurrent()
    .then((tracks) => {
      loaded = { tracks, at: Date.now() };
      return tracks;
    })
    .catch((error: unknown) => {
      console.error("Cannot load the oceanic tracks", error);
      return loaded?.tracks ?? NO_TRACKS;
    })
    .finally(() => {
      pending = null;
    });

  return pending;
}

export function useOceanicTracks(enabled: boolean): OceanicTrack[] {
  const { publicOceanicTrackService } = usePublicApi();
  const [tracks, setTracks] = useState<OceanicTrack[]>(() => loaded?.tracks ?? NO_TRACKS);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;
    const refresh = () =>
      loadTracks(publicOceanicTrackService).then((fetched) => {
        if (!cancelled) {
          setTracks(fetched);
          setNow(new Date());
        }
      });

    refresh();
    const timer = window.setInterval(refresh, REFRESH_MS);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [enabled, publicOceanicTrackService]);

  useEffect(() => {
    const change = enabled ? nextValidityChange(tracks, now) : null;

    if (change === null) {
      return;
    }

    const timer = window.setTimeout(() => setNow(new Date()), Math.min(change.getTime() - now.getTime(), REFRESH_MS));

    return () => window.clearTimeout(timer);
  }, [enabled, tracks, now]);

  return useMemo(() => (enabled ? tracksInForce(tracks, now) : NO_TRACKS), [enabled, tracks, now]);
}
