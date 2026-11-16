import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, within } from "storybook/test";
import { FixFuelReportsCard } from "~/features/flight/components/Briefing/FixFuelReportsCard";
import { oceanicFixes } from "~/features/flight/lib/briefingPhase";
import { natBriefing, natBriefingWithReports } from "../../fixtures/briefing";

const TAKEOFF = new Date("2026-01-06T09:20:00.000Z");
const MALOT = natBriefing.route.fixes.find((fix) => fix.ident === "MALOT");

function reported(count: number) {
  const plan = natBriefingWithReports(TAKEOFF, count);

  return oceanicFixes(plan.route.fixes, plan.oceanicCrossing);
}

const meta = {
  title: "Tracking/Briefing/Fix fuel reports card",
  component: FixFuelReportsCard,
  args: {
    title: "Position and fuel reports",
    fixes: reported(0),
    takeoffTime: TAKEOFF,
    canReport: true,
    onReport: fn(async () => {}),
  },
  argTypes: {
    fixes: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          "The fixes to report across the ocean, from LH82's seeded plan on NAT track E: planned and minimum fuel on board from the nav log, the reported figure and its difference from plan. The next fix to report is highlighted, with Report beside it. ETAs count from the actual takeoff.",
      },
    },
  },
} satisfies Meta<typeof FixFuelReportsCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const BeforeEntry: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getAllByRole("button", { name: /^Report/ })).toHaveLength(1);
  },
};

export const MidOcean: Story = {
  args: { fixes: reported(3) },
};

export const BelowMinimum: Story = {
  args: {
    fixes:
      MALOT === undefined
        ? []
        : [{ ...MALOT, fuelReport: { actualOnBoard: 32_500, reportedAt: "2026-01-06T11:47:00.000Z" } }],
  },
};

export const BeforeDeparture: Story = {
  args: { takeoffTime: null, canReport: false },
};
