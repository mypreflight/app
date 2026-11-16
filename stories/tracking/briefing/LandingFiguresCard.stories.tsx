import type { Meta, StoryObj } from "@storybook/react-vite";
import { LandingFiguresCard } from "~/features/flight/components/Briefing/LandingFiguresCard";
import { oceanicFixes } from "~/features/flight/lib/briefingPhase";
import { natBriefing, natBriefingWithReports, natLoadsheets } from "../../fixtures/briefing";
import { atWidth } from "../../support/frames";

const TAKEOFF = new Date("2026-01-06T09:20:00.000Z");
const DESTINATION = natBriefing.route.fixes[natBriefing.route.fixes.length - 1];
const reportedPlan = natBriefingWithReports(TAKEOFF, 6);
const lastReport = oceanicFixes(reportedPlan.route.fixes, reportedPlan.oceanicCrossing).at(-1) ?? null;
const zeroFuelWeightKg = (natLoadsheets.preliminary?.zeroFuelWeight ?? 0) * 1000;

const meta = {
  title: "Tracking/Briefing/Landing figures card",
  component: LandingFiguresCard,
  decorators: [atWidth(380)],
  args: {
    destination: DESTINATION,
    lastReport: null,
    zeroFuelWeightKg,
    topOfDescent: new Date("2026-01-06T17:07:00.000Z"),
  },
  argTypes: {
    destination: { control: false },
    lastReport: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Fuel and weight on landing. Planned and minimum fuel at the destination come from the nav log; after a fix report, the difference from plan carries into the expected figure, the margin and the landing weight. LH82's seeded plan and loadsheet.",
      },
    },
  },
} satisfies Meta<typeof LandingFiguresCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const FromTheNavLog: Story = {};

export const AfterTheLastOceanicReport: Story = {
  args: { lastReport },
};

export const WithoutALoadsheet: Story = {
  args: { zeroFuelWeightKg: null, topOfDescent: null },
};
