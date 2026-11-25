import type { HoldDeckName, LoadingPosition } from "~/features/cargo-hold/model";
import type { CargoShipmentEntry, CargoUnitEntry, FlightCargoManifest } from "~/features/cargo-manifest/model";

export type IndexedShipment = {
  shipment: CargoShipmentEntry;
  unit: CargoUnitEntry;
  loadingPosition: LoadingPosition | null;
  compartment: number | null;
  deck: HoldDeckName | null;
};

export function shipmentIndex(manifest: FlightCargoManifest): IndexedShipment[] {
  return manifest.units.flatMap((unit) =>
    unit.shipments.map((shipment) => ({
      shipment,
      unit,
      loadingPosition: unit.loadingPosition,
      compartment: unit.compartment,
      deck: unit.deck,
    })),
  );
}

export function unitsCarryingShipments(manifest: FlightCargoManifest): CargoUnitEntry[] {
  return manifest.units.filter((unit) => unit.shipments.length > 0);
}
