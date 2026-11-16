import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { expect, fn, within } from "storybook/test";
import { BriefingRecordsStrip } from "~/features/flight/components/Briefing/BriefingRecordsStrip";
import { BriefingDocument } from "~/features/flight/lib/briefingPhase";
import { AppBottomBar } from "~/shared/ui/Shell/AppBottomBar";

const meta = {
  title: "Shared/Shell/Bottom bar",
  component: AppBottomBar,
  parameters: {
    docs: {
      description: {
        component:
          "The bar below the outlet, from `md` up. It belongs to the page, which fills it through `ShellSlotPortal` with `ShellSlot.BottomBar`, and it takes no room while the page leaves it empty. The flight briefing puts its load documents, records and abnormal actions there.",
      },
    },
  },
} satisfies Meta<typeof AppBottomBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OnTheFlightBriefing: Story = {
  render: () => (
    <AppBottomBar>
      <BriefingRecordsStrip
        load={[
          { document: BriefingDocument.Cabin, label: "Cabin and manifest", href: "#cabin" },
          { document: BriefingDocument.Cargo, label: "Cargo", href: "#cargo" },
        ]}
        records={[
          { document: BriefingDocument.Timesheet, label: "Timesheet", href: "#timesheet" },
          { document: BriefingDocument.Activity, label: "Activity log", href: "#activity" },
          { document: BriefingDocument.Delay, label: "Delay report", href: "#delay" },
        ]}
        canDeclareEmergency={true}
        canReportDiversion={true}
        onDeclareEmergency={fn()}
        onReportDiversion={fn()}
      />
    </AppBottomBar>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("button", { name: "Declare emergency" })).toBeInTheDocument();
  },
};
