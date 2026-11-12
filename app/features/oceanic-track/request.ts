import type { OceanicTrack } from "~/features/oceanic-track/model";

export type GetOceanicTrackResponse = Omit<OceanicTrack, "validFrom" | "validTo"> & {
  validFrom: string;
  validTo: string;
};

export type GetCurrentOceanicTracksResponse = {
  fetchedAt: string;
  tracks: GetOceanicTrackResponse[];
};
