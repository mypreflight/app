import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { expect, userEvent, within } from "storybook/test";
import { HoldDeckName, PositionSide } from "~/features/cargo-hold/model";
import {
  DrillLetter,
  HazardClass,
  PackingGroup,
  QuantityUnit,
  SpecialHandlingCode,
} from "~/features/cargo-manifest/model";
import { SpecialServiceRequest } from "~/features/flight/model";
import { DangerousGoodsLine } from "~/features/notoc/components/DangerousGoodsLine";
import { DryIceLine } from "~/features/notoc/components/DryIceLine";
import { NotocCertification } from "~/features/notoc/components/NotocCertification";
import { SpecialLoadLine } from "~/features/notoc/components/SpecialLoadLine";
import { SpecialPassengerLine } from "~/features/notoc/components/SpecialPassengerLine";
import { groupSpecialPassengers } from "~/features/notoc/lib/specialPassengerGroups";
import {
  HandlingRemark,
  HoldCondition,
  type NotocDangerousGoods,
  type NotocDryIce,
  type NotocHeader,
  type NotocSpecialLoad,
  type NotocSpecialPassenger,
  RadioactiveCategory,
} from "~/features/notoc/model";

const drill = {
  responseCode: { drillNumber: 3 as const, drillLetters: [DrillLetter.OtherRiskLowOrNone] },
  inherentRisk: "Flammable liquid or solid; vapours may form an explosive mixture.",
  riskToAircraftAndOccupants: "Rapid fire spread and dense smoke; heat may weaken structure and burn anyone in reach.",
  spillAndFireProcedure:
    "Contain the spill and keep every ignition source away. Fight the fire with water spray, foam, dry chemical or carbon dioxide.",
  additionalRisks: ["No significant risk beyond the drill itself."],
};

const paint: NotocDangerousGoods = {
  awb: "172-62001133",
  unNumber: "1263",
  properShippingName: "Paint",
  hazardClass: HazardClass.FlammableLiquid,
  classOrDivision: HazardClass.FlammableLiquid,
  subsidiaryRisk: null,
  packingGroup: PackingGroup.II,
  packages: 78,
  netQuantity: { amount: 5, unit: QuantityUnit.Litres },
  radioactive: null,
  impCode: SpecialHandlingCode.FlammableLiquid,
  uldId: "AKE62014CV",
  cargoAircraftOnly: false,
  loadingPosition: { deck: HoldDeckName.Lower, compartment: 1, row: 1, side: PositionSide.Left },
  compartment: 1,
  unloadingAirport: "JFK",
  drill,
};

const dryIce: NotocDryIce = {
  compartment: 1,
  packages: 41,
  kg: 900,
  unloadingAirport: "JFK",
  drill: { ...drill, responseCode: { drillNumber: 9, drillLetters: [DrillLetter.Anaesthetic] } },
};

const radiopharmaceuticals: NotocDangerousGoods = {
  ...paint,
  awb: "172-62001177",
  unNumber: "2915",
  properShippingName: "Radioactive material, Type A package",
  hazardClass: HazardClass.Radioactive,
  classOrDivision: HazardClass.Radioactive,
  packingGroup: null,
  packages: 2,
  netQuantity: { amount: 1, unit: QuantityUnit.Terabecquerels },
  radioactive: { category: RadioactiveCategory.IIYellow, transportIndex: 0.6 },
  impCode: SpecialHandlingCode.RadioactiveYellow,
  uldId: null,
  loadingPosition: null,
  compartment: 5,
  drill: { ...drill, responseCode: { drillNumber: 7, drillLetters: [DrillLetter.OtherRiskLowOrNone] } },
};

const horses: NotocSpecialLoad = {
  awb: "172-62001100",
  description: "Live horses in air stalls",
  pieces: 7,
  shc: [SpecialHandlingCode.LiveAnimals, SpecialHandlingCode.Heavy],
  grossKg: 4000,
  handlingRemark: HandlingRemark.HorsesWithGroom,
  temperature: null,
  holdCondition: HoldCondition.HeatedAndVentilated,
  uldId: "AMA62011CV",
  loadingPosition: { deck: HoldDeckName.Main, compartment: 6, row: 1, side: PositionSide.Left },
  compartment: 6,
  unloadingAirport: "JFK",
  heaviestPiece: { kg: 572, lengthCm: 300, widthCm: 110, heightCm: 230 },
};

const wheelchair: NotocSpecialPassenger = {
  seat: "34C",
  ssr: SpecialServiceRequest.WheelchairLithiumBattery,
  mobilityAid: { compartment: 5 },
};

const infants: NotocSpecialPassenger[] = ["12A", "14C", "31D"].map((seat) => ({
  seat,
  ssr: SpecialServiceRequest.Infant,
  mobilityAid: null,
}));

const header: NotocHeader = {
  operatorName: "American Airlines, Inc.",
  flightNumber: "AA2010",
  flightDate: "2026-06-02",
  stationOfLoading: "JFK",
  stationOfLoadingCity: "New York",
  aircraftRegistration: "N78881",
  aircraftType: "B77W",
  preparedBy: "Cameron Goldner",
  loadingSupervisor: "Ettie Maggio",
  emergencyTelephone: "+44 20 7946 0639",
};

function Entries() {
  return (
    <div className="flex max-w-2xl flex-col gap-6 bg-white p-6 dark:bg-gray-900">
      <ul className="divide-y divide-gray-100 dark:divide-gray-800">
        <DangerousGoodsLine entry={paint} hasCuratedHold />
        <DangerousGoodsLine
          entry={{
            ...paint,
            awb: "172-62001144",
            cargoAircraftOnly: true,
            uldId: "PMC41235CV",
            loadingPosition: { deck: HoldDeckName.Lower, compartment: 2, row: 1, side: PositionSide.Full },
            compartment: 2,
          }}
          hasCuratedHold
        />
        <DryIceLine entry={dryIce} hasCuratedHold />
        <DangerousGoodsLine entry={radiopharmaceuticals} hasCuratedHold />
      </ul>
      <ul className="divide-y divide-gray-100 dark:divide-gray-800">
        <SpecialLoadLine load={horses} coldChain={[]} hasCuratedHold />
        <SpecialLoadLine
          coldChain={[]}
          load={{
            ...horses,
            awb: "172-62001122",
            pieces: 1,
            handlingRemark: null,
            holdCondition: null,
            heaviestPiece: null,
          }}
          hasCuratedHold
        />
      </ul>
      <ul>
        {groupSpecialPassengers([wheelchair, ...infants]).map((group) => (
          <SpecialPassengerLine key={`${group.ssr}-${group.seats[0]}`} group={group} />
        ))}
      </ul>
      <NotocCertification header={header} acceptance={{ name: "Rick Doe", at: "2026-06-02T08:00:00Z" }} />
    </div>
  );
}

const meta = {
  title: "Tracking/Briefing/NOTOC entries",
  component: Entries,
  parameters: {
    docs: {
      description: {
        component:
          "The rows of the digital notification to captain: dangerous goods with their class, quantity, ULD and position, dry ice totalled per compartment, a radioactive package by category and transport index, special loads with their supplementary information, a special category passenger, and the certification.",
      },
    },
  },
} satisfies Meta<typeof Entries>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Rows: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("900 kg total", { exact: false })).toBeInTheDocument();
    await expect(canvas.getByText("2 pkg · II-YELLOW · TI 0.6", { exact: false })).toBeInTheDocument();
    await expect(canvas.getByText("Cargo aircraft only")).toBeInTheDocument();
    await expect(canvas.getByText("HEATED AND VENTILATED HOLD")).toBeInTheDocument();
    await expect(canvas.getByText("HEAVIEST PIECE 572 KG, 300x110x230 CM")).toBeInTheDocument();
    await expect(canvas.getByText("LITHIUM BATTERY REMOVED, IN CABIN AT 34C")).toBeInTheDocument();
    await expect(canvas.getByText("MOBILITY AID IN HOLD, CPT 5")).toBeInTheDocument();
    await expect(canvas.getByText("1 pc · 4,000 kg", { exact: false })).toBeInTheDocument();
    await expect(canvas.getByText("Wheelchair, lithium battery")).toBeInTheDocument();
    await expect(canvas.getByText("12A 14C 31D")).toBeInTheDocument();
    await expect(canvas.getByText("+44 20 7946 0639")).toBeInTheDocument();
  },
};

export const WritesPositionsAndCodes: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("11L")).toBeInTheDocument();
    await expect(canvas.getByText("21P")).toBeInTheDocument();
    await expect(canvas.getAllByText("AL")).toHaveLength(2);
    await expect(canvas.getByText("CPT 1")).toBeInTheDocument();
    await expect(canvas.getByText("CPT 5")).toBeInTheDocument();
    await expect(canvas.getAllByRole("button", { name: "Emergency response drill 3L for Paint" })).toHaveLength(2);
    await expect(canvas.getByRole("button", { name: "Emergency response drill 9A for Dry ice" })).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", { name: "Emergency response drill 7L for Radioactive material, Type A package" }),
    ).toBeInTheDocument();
  },
};

export const OpensTheDrill: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Emergency response drill 9A for Dry ice" }));

    const dialog = await within(canvasElement.ownerDocument.body).findByRole("dialog");
    await expect(within(dialog).getByText(drill.spillAndFireProcedure)).toBeInTheDocument();
  },
};
