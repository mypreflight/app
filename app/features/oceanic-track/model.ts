import type { OceanicDirection } from "~/features/route/model";

export enum OceanicTrackSystem {
  Nat = "nat",
  Pacots = "pacots",
}

export type OceanicTrackFix = {
  ident: string;
  latitude: number;
  longitude: number;
};

export type OceanicTrack = {
  system: OceanicTrackSystem;
  identifier: string;
  direction: OceanicDirection;
  issuingAuthority: string;
  notamNumber: string;
  validFrom: Date;
  validTo: Date;
  route: string;
  levels: number[];
  fixes: OceanicTrackFix[];
  unresolvedFixes: string[];
  remarks: string | null;
  message: string;
};
