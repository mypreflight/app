import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { FlightStatus } from "~/features/flight";
import { ArrivalBriefing } from "~/features/flight/components/Briefing/ArrivalBriefing";
import { EnRouteBriefing } from "~/features/flight/components/Briefing/EnRouteBriefing";
import { PreflightBriefing } from "~/features/flight/components/Briefing/PreflightBriefing";
import { BriefingPhase } from "~/features/flight/lib/briefingPhase";
import { natApi } from "../../fixtures/briefing";
import { withApi } from "../../support/api";
import { NAT_STATUSES, type NatArgs, onNatFlight } from "../../support/briefing";
import { atWidth } from "../../support/frames";

type PageArgs = NatArgs & { phase: BriefingPhase };

function PhasePage({ phase }: PageArgs) {
  if (phase === BriefingPhase.Preflight) {
    return <PreflightBriefing documentHref={(document) => `#${document}`} />;
  }

  return phase === BriefingPhase.EnRoute ? <EnRouteBriefing navLogHref="#nav-log" /> : <ArrivalBriefing />;
}

const meta = {
  title: "Tracking/Briefing/Phase pages",
  component: PhasePage,
  decorators: [onNatFlight, withApi(natApi), atWidth(1180)],
  args: {
    phase: BriefingPhase.Preflight,
    status: FlightStatus.CheckedIn,
    reports: 0,
  },
  argTypes: {
    phase: { control: "inline-radio", options: Object.values(BriefingPhase) },
    status: { control: "select", options: NAT_STATUSES },
    reports: { control: { type: "range", min: 0, max: 6 }, description: "Oceanic fixes already reported, in cruise." },
  },
  parameters: {
    docs: {
      description: {
        component:
          "`PreflightBriefing`, `EnRouteBriefing` and `ArrivalBriefing` on LH82, the seeded Frankfurt to New York flight across NAT track E. Weather, manifest, runway and stand come from seeded data served by the story; other requests are not served.",
      },
    },
  },
} satisfies Meta<typeof PhasePage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Preflight: Story = {};

export const OceanicBeforeDeparture: Story = {
  args: { phase: BriefingPhase.EnRoute },
};

export const OceanicInCruise: Story = {
  args: { phase: BriefingPhase.EnRoute, status: FlightStatus.InCruise, reports: 3 },
};

export const Arrival: Story = {
  args: { phase: BriefingPhase.Arrival, status: FlightStatus.InCruise, reports: 6 },
};

export const PreflightOnALaptop: Story = {
  decorators: [atWidth(900)],
};
