import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { expect, within } from "storybook/test";
import { FlightStatus } from "~/features/flight";
import { FlightBriefing } from "~/features/flight/components/Briefing/FlightBriefing";
import { FlightRecords } from "~/features/flight/components/Briefing/FlightRecords";
import { BriefingPhase } from "~/features/flight/lib/briefingPhase";
import { briefingView, natApi, natFlight } from "../../fixtures/briefing";
import { withApi } from "../../support/api";
import { NAT_STATUSES, type NatArgs, onNatFlight } from "../../support/briefing";
import { atWidth } from "../../support/frames";
import { withBottomBar } from "../../support/shell";

type BriefingArgs = NatArgs & { phase: BriefingPhase | null };

function Briefing({ status, phase }: BriefingArgs) {
  const trackingView = briefingView(natFlight(status), phase);

  return (
    <>
      <FlightBriefing trackingView={trackingView} />
      <FlightRecords trackingView={trackingView} />
    </>
  );
}

const meta = {
  title: "Tracking/Briefing/Flight briefing",
  component: Briefing,
  decorators: [onNatFlight, withApi(natApi), withBottomBar, atWidth(1180)],
  args: {
    status: FlightStatus.InCruise,
    reports: 3,
    phase: null,
  },
  argTypes: {
    status: { control: "select", options: NAT_STATUSES },
    reports: { control: { type: "range", min: 0, max: 6 } },
    phase: {
      control: "inline-radio",
      options: [null, ...Object.values(BriefingPhase)],
      description: "The phase named in the address; none follows the flight.",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "The whole Briefing view below the phase card: phase tabs, the phase heading with its documents, the phase page, and the records strip, which goes to the bottom bar from `md` up and ends the page below it. Without a phase in the address it shows the phase the flight is in. LH82, seeded.",
      },
    },
  },
} satisfies Meta<typeof Briefing>;

export default meta;

type Story = StoryObj<typeof meta>;

export const InCruise: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", { current: "page" })).toHaveTextContent("Oceanic");
    await expect(await canvas.findByText("Position and fuel reports")).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Declare emergency" })).toBeEnabled();
  },
};

export const AfterCheckIn: Story = {
  args: { status: FlightStatus.CheckedIn, reports: 0 },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("link", { current: "page" })).toHaveTextContent("Preflight");
  },
};

export const ReadingTheArrivalEarly: Story = {
  args: { status: FlightStatus.CheckedIn, reports: 0, phase: BriefingPhase.Arrival },
};
