import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { expect, within } from "storybook/test";
import { BriefingPhaseTabs } from "~/features/flight/components/Briefing/BriefingPhaseTabs";
import { BRIEFING_PHASES, BriefingPhase, briefingPhaseState } from "~/features/flight/lib/briefingPhase";

type TabsArgs = {
  current: BriefingPhase;
  selected: BriefingPhase;
  oceanic: boolean;
};

const SUMMARIES: Record<BriefingPhase, string> = {
  [BriefingPhase.Preflight]: "Frankfurt · off-block 09:00Z",
  [BriefingPhase.EnRoute]: "Track E · TMI 246 · EGGX",
  [BriefingPhase.Arrival]: "New York · on-block 17:25Z",
};

const meta = {
  title: "Tracking/Briefing/Phase tabs",
  render: ({ current, selected, oceanic }) => (
    <BriefingPhaseTabs
      selected={selected}
      tabs={BRIEFING_PHASES.map((phase) => ({
        phase,
        label:
          phase === BriefingPhase.EnRoute
            ? oceanic
              ? "Oceanic"
              : "En route"
            : phase === BriefingPhase.Preflight
              ? "Preflight"
              : "Arrival",
        summary: SUMMARIES[phase],
        state: briefingPhaseState(phase, current),
        href: `#${phase}`,
      }))}
    />
  ),
  args: {
    current: BriefingPhase.EnRoute,
    selected: BriefingPhase.EnRoute,
    oceanic: true,
  },
  argTypes: {
    current: {
      control: "inline-radio",
      options: Object.values(BriefingPhase),
      description: "The phase the flight is in.",
    },
    selected: { control: "inline-radio", options: Object.values(BriefingPhase), description: "The phase on screen." },
    oceanic: { description: "Whether the plan flies an oceanic track, which names the middle tab." },
  },
  parameters: {
    docs: {
      description: {
        component:
          "The three phases of the briefing. Finished phases carry Done, the current one Now, and each tab gives a one-line summary of its phase. The summaries hide on a phone.",
      },
    },
  },
} satisfies Meta<TabsArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OverTheOcean: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", { current: "page" })).toHaveTextContent("Oceanic");
    await expect(canvas.getByText("Done")).toBeVisible();
  },
};

export const BeforeDeparture: Story = {
  args: { current: BriefingPhase.Preflight, selected: BriefingPhase.Preflight },
};

export const ReadingAhead: Story = {
  args: { current: BriefingPhase.Preflight, selected: BriefingPhase.Arrival, oceanic: false },
};
