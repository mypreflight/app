import type { OceanicTrack } from "~/features/oceanic-track/model";
import type { GetCurrentOceanicTracksResponse } from "~/features/oceanic-track/request";
import { toOceanicTracks } from "~/features/oceanic-track/transformer";
import { AbstractApiService } from "~/shared/api/api.service";

export class PublicOceanicTrackService extends AbstractApiService {
  async fetchCurrent(): Promise<OceanicTrack[]> {
    return toOceanicTracks(await this.request<GetCurrentOceanicTracksResponse>("/api/v1/oceanic-track"));
  }
}
