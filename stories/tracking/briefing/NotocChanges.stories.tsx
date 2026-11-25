import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { expect, within } from "storybook/test";
import { HoldDeckName, PositionSide } from "~/features/cargo-hold/model";
import { NotocChangesSummary } from "~/features/notoc/components/NotocChangesSummary";
import type { NotocChanges } from "~/features/notoc/model";

const changes: NotocChanges = {
  changed: true,
  dangerousGoodsAdded: ["172-62001144"],
  dangerousGoodsRemoved: [],
  specialLoadsAdded: [],
  specialLoadsRemoved: ["172-62001122"],
  repositioned: [
    {
      awb: "172-62001133",
      fromPosition: { deck: HoldDeckName.Lower, compartment: 1, row: 1, side: PositionSide.Left },
      toPosition: { deck: HoldDeckName.Lower, compartment: 2, row: 1, side: PositionSide.Right },
    },
    {
      awb: "172-62001100",
      fromPosition: { deck: HoldDeckName.Main, compartment: 6, row: 3, side: PositionSide.Left },
      toPosition: null,
    },
  ],
  cargoChangeKg: -1500,
  deadloadChangeKg: -1500,
};

function Summary() {
  return (
    <div className="max-w-2xl bg-white p-6 dark:bg-gray-900">
      <NotocChangesSummary changes={changes} />
    </div>
  );
}

const meta = {
  title: "Tracking/Briefing/NOTOC changes",
  component: Summary,
  parameters: {
    docs: {
      description: {
        component:
          "What the final notification reports as changed since the preliminary one: loads added and removed, each load that moved with the position it left and the one it holds now, and the change in cargo and deadload.",
      },
    },
  },
} satisfies Meta<typeof Summary>;

export default meta;

type Story = StoryObj<typeof meta>;

export const MovedLoads: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("172-62001133 11L → 21R, 172-62001100 CL → loose")).toBeInTheDocument();
    await expect(canvas.getByText("172-62001144")).toBeInTheDocument();
    await expect(canvas.getByText("Cargo down 1,500 kg")).toBeInTheDocument();
  },
};
