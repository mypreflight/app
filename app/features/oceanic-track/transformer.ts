import type { OceanicTrack } from "~/features/oceanic-track/model";
import type { GetCurrentOceanicTracksResponse } from "~/features/oceanic-track/request";

export function toOceanicTracks(response: GetCurrentOceanicTracksResponse): OceanicTrack[] {
  return response.tracks.map((track) => ({
    ...track,
    validFrom: new Date(track.validFrom),
    validTo: new Date(track.validTo),
  }));
}
