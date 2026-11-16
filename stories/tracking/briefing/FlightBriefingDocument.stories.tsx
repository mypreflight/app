import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { fn } from "storybook/test";
import { FlightStatus } from "~/features/flight";
import { FlightBriefingDocument } from "~/features/flight/components/Briefing/FlightBriefingDocument";
import { BriefingDocument } from "~/features/flight/lib/briefingPhase";
import type { SpecialServiceRequest } from "~/features/flight/model";
import { natApi } from "../../fixtures/briefing";
import { withApi } from "../../support/api";
import { type NatArgs, onNatFlight } from "../../support/briefing";

type DocumentArgs = NatArgs & { document: BriefingDocument; onClose: () => void };

function Document({ document, onClose }: DocumentArgs) {
  const [request, setRequest] = useState<SpecialServiceRequest | null>(null);

  return (
    <FlightBriefingDocument
      document={document}
      pilRequest={request}
      onPilRequestChange={setRequest}
      onClose={onClose}
    />
  );
}

const meta = {
  title: "Tracking/Briefing/Briefing document",
  component: Document,
  decorators: [onNatFlight, withApi(natApi)],
  args: {
    document: BriefingDocument.Pil,
    status: FlightStatus.InCruise,
    reports: 3,
    onClose: fn(),
  },
  argTypes: {
    document: { control: "select", options: Object.values(BriefingDocument) },
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      story: { inline: false, iframeHeight: 640 },
      description: {
        component:
          "Picks the panel for a briefing document and fills it with today's panel for that data: nav log, OFP, runway analysis, NOTOC, PIL, cabin and manifest, cargo, timesheets, activity log, delay report, emergencies and diversions. LH82, seeded; documents whose data the story does not serve show their unavailable state.",
      },
    },
  },
} satisfies Meta<typeof Document>;

export default meta;

type Story = StoryObj<typeof meta>;

export const PassengerInformationList: Story = {};

export const NavLog: Story = {
  args: { document: BriefingDocument.NavLog },
};

export const Timesheet: Story = {
  args: { document: BriefingDocument.Timesheet },
};
