import type { OceanicTrack } from "~/features/oceanic-track/model";

export function tracksInForce(tracks: OceanicTrack[], now: Date): OceanicTrack[] {
  return tracks.filter((track) => track.validFrom <= now && now < track.validTo);
}

export function nextValidityChange(tracks: OceanicTrack[], now: Date): Date | null {
  const upcoming = tracks
    .flatMap((track) => [track.validFrom, track.validTo])
    .filter((moment) => moment > now)
    .sort((a, b) => a.getTime() - b.getTime());

  return upcoming.at(0) ?? null;
}
