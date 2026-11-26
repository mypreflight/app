import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { expect, within } from "storybook/test";
import { coldChainExplanationOf } from "~/features/cargo-manifest/lib/cargoWording";
import { type ColdChain, ColdChainReasonKind, ColdChainSolution } from "~/features/cargo-manifest/model";

type Case = {
  assessment: Pick<ColdChain, "reason" | "solution" | "enduranceHours" | "exposureHours" | "marginHours">;
  sentence: string;
};

const passive = { solution: ColdChainSolution.Passive, enduranceHours: 30 };

const CASES: Case[] = [
  {
    assessment: {
      reason: { kind: ColdChainReasonKind.WithinMargin },
      solution: ColdChainSolution.Active,
      enduranceHours: 100,
      exposureHours: 12,
      marginHours: 88,
    },
    sentence: "An active container with 88 h margin on a 100 h endurance.",
  },
  {
    assessment: { ...passive, reason: { kind: ColdChainReasonKind.ThinMargin }, exposureHours: 16, marginHours: 14 },
    sentence: "A passive shipper with 14 h margin on a 30 h endurance; no cooling available in flight.",
  },
  {
    assessment: {
      reason: { kind: ColdChainReasonKind.ThinMargin },
      solution: ColdChainSolution.DryIce,
      enduranceHours: 48,
      exposureHours: 30.5,
      marginHours: 17.5,
    },
    sentence: "A dry ice pack with 17.5 h margin on a 48 h endurance; no cooling available in flight.",
  },
  {
    assessment: {
      ...passive,
      reason: { kind: ColdChainReasonKind.EnduranceExceeded },
      exposureHours: 34,
      marginHours: -4,
    },
    sentence: "Exposure of 34 h exceeds the 30 h endurance of a passive shipper.",
  },
  {
    assessment: {
      ...passive,
      reason: { kind: ColdChainReasonKind.HotTransfer, ambientC: 31 },
      exposureHours: 10,
      marginHours: 20,
    },
    sentence: "31 °C at the transfer point exceeds what a passive shipper is validated for.",
  },
  ...[
    { hours: 9, sentence: "A 9 h connection leaves the shipment on a passive shipper longer than it should be." },
    { hours: 8.8, sentence: "An 8.8 h connection leaves the shipment on a passive shipper longer than it should be." },
    { hours: 11, sentence: "An 11 h connection leaves the shipment on a passive shipper longer than it should be." },
    { hours: 18, sentence: "An 18 h connection leaves the shipment on a passive shipper longer than it should be." },
  ].map(({ hours, sentence }) => ({
    assessment: {
      ...passive,
      enduranceHours: 200,
      reason: { kind: ColdChainReasonKind.LongConnection, connectionHours: hours } as const,
      exposureHours: 20,
      marginHours: 180,
    },
    sentence,
  })),
];

function Sentences() {
  return (
    <ul className="flex flex-col gap-1 bg-white p-6 text-sm text-gray-700 dark:bg-gray-900 dark:text-gray-300">
      {CASES.map(({ sentence, assessment }) => (
        <li key={sentence}>{coldChainExplanationOf(assessment)}</li>
      ))}
    </ul>
  );
}

const meta = {
  title: "Tracking/Briefing/Cold chain reasons",
  component: Sentences,
  parameters: {
    docs: {
      description: {
        component:
          "How each cold chain reason the API reports is worded: within margin, a thin margin with no cooling in flight, an exceeded endurance, a hot transfer point and a long connection, with the article that fits the connection's length.",
      },
    },
  },
} satisfies Meta<typeof Sentences>;

export default meta;

type Story = StoryObj<typeof meta>;

export const EveryReason: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    for (const { sentence } of CASES) {
      await expect(canvas.getByText(sentence)).toBeInTheDocument();
    }
  },
};
