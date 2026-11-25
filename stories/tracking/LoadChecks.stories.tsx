import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { expect, within } from "storybook/test";
import { HoldDeckName } from "~/features/cargo-hold/model";
import { LoadAdvisories } from "~/features/cargo-manifest/components/LoadAdvisories";
import { HOLD_CONFIGURATION_UNREADABLE, NO_CURATED_HOLD_DATA } from "~/features/cargo-manifest/hooks/useFlightCargo";
import { loadAdvisories } from "~/features/cargo-manifest/lib/advisories";
import {
  type CargoShipmentEntry,
  CargoUnitKind,
  Commodity,
  ContentClass,
  type FlightCargoManifest,
  OffloadReason,
  ShipmentStatus,
  SpecialHandlingCode,
  TransferRole,
} from "~/features/cargo-manifest/model";
import { FlightServiceType } from "~/features/flight";

function shipment(
  awb: string,
  commodity: Commodity,
  shc: SpecialHandlingCode[],
  status = ShipmentStatus.Loaded,
): CargoShipmentEntry {
  return {
    awb,
    commodity,
    description: commodity,
    pieces: 2,
    grossKg: 120,
    volumeM3: 0.8,
    shc,
    shipper: "Shipper",
    consignee: "Consignee",
    origin: "FRA",
    destination: "JFK",
    transferRole: TransferRole.Local,
    onwardCarrier: null,
    onwardFlightNumber: null,
    connectionMinutes: null,
    connectionAtRisk: false,
    dangerousGoods: null,
    coldChain: null,
    status,
    offloadReason: status === ShipmentStatus.Loaded ? null : OffloadReason.PayloadRestriction,
    offloadedFromPosition: null,
  };
}

const manifest: FlightCargoManifest = {
  flightId: "flight-1",
  holdVariant: "b77w-ld3",
  cargoKg: 360,
  containerCount: 0,
  bulkLotCount: 1,
  shipmentCount: 3,
  dangerousGoodsCount: 1,
  worstColdChainRisk: null,
  cargoAircraftOnlyCount: 0,
  transferCount: 0,
  tightestConnectionMinutes: null,
  baggageKg: 0,
  bagCount: 0,
  baggageSource: null,
  compartmentLoad: [{ compartment: 3, deck: HoldDeckName.Lower, weightKg: 360, dryIceKg: 120 }],
  segregationAdvisories: [
    {
      compartment: 3,
      deck: HoldDeckName.Lower,
      one: SpecialHandlingCode.DryIce,
      other: SpecialHandlingCode.LiveAnimalsHold,
    },
  ],
  units: [
    {
      kind: CargoUnitKind.BulkLot,
      uldCode: null,
      uldType: null,
      loadingPosition: null,
      compartment: 3,
      deck: HoldDeckName.Lower,
      tareKg: 0,
      grossKg: 360,
      volumeM3: 2.4,
      contentClass: ContentClass.Cargo,
      beyondDestination: null,
      sealed: false,
      bagCount: null,
      priority: false,
      shipments: [
        shipment("172-62001111", Commodity.DryIce, [SpecialHandlingCode.DryIce]),
        shipment("172-62001122", Commodity.PetsInHold, [SpecialHandlingCode.LiveAnimalsHold]),
        shipment("172-62001133", Commodity.DryIce, [SpecialHandlingCode.DryIce], ShipmentStatus.Offloaded),
      ],
    },
  ],
};

function Checks({ holdVariant, note }: { holdVariant: string | null; note: string }) {
  return (
    <div className="max-w-2xl bg-white p-6 dark:bg-gray-900">
      <LoadAdvisories
        checks={loadAdvisories({
          manifest: {
            ...manifest,
            holdVariant,
            segregationAdvisories: holdVariant === null ? [] : manifest.segregationAdvisories,
          },
          variant: null,
          serviceType: FlightServiceType.Passenger,
          holdDataNote: note,
        })}
      />
    </div>
  );
}

const meta = {
  title: "Tracking/Cargo load checks",
  component: Checks,
  args: { holdVariant: "b77w-ld3", note: HOLD_CONFIGURATION_UNREADABLE },
  parameters: {
    docs: {
      description: {
        component:
          "The checks the cargo page runs on the load. Incompatible loads are the pairs of handling codes the manifest reports sharing a compartment; each finding names the waybills that carry them.",
      },
    },
  },
} satisfies Meta<typeof Checks>;

export default meta;

type Story = StoryObj<typeof meta>;

function rowOf(canvasElement: HTMLElement, label: string): HTMLElement {
  const row = within(canvasElement).getByText(label).closest("li");
  if (row === null) {
    throw new Error(`No row for ${label}`);
  }
  return row;
}

export const IncompatibleLoads: Story = {
  play: async ({ canvasElement }) => {
    const row = within(rowOf(canvasElement, "Incompatible loads kept in separate compartments"));

    await expect(row.getByText("Raised")).toBeInTheDocument();
    await expect(
      row.getByText("Compartment 3 carries dry ice together with live animals in the hold"),
    ).toBeInTheDocument();
    await expect(row.getByText("AWB 172-62001111 ICE · AWB 172-62001122 AVIH")).toBeInTheDocument();
  },
};

export const NoHoldData: Story = {
  args: { holdVariant: null, note: NO_CURATED_HOLD_DATA },
  play: async ({ canvasElement }) => {
    const row = within(rowOf(canvasElement, "Incompatible loads kept in separate compartments"));

    await expect(row.getByText("Not applicable")).toBeInTheDocument();
    await expect(row.getByText(NO_CURATED_HOLD_DATA)).toBeInTheDocument();
  },
};
