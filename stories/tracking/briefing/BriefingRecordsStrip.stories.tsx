import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { BriefingRecordsStrip } from "~/features/flight/components/Briefing/BriefingRecordsStrip";
import { BriefingDocument } from "~/features/flight/lib/briefingPhase";

const meta = {
  title: "Tracking/Briefing/Records strip",
  component: BriefingRecordsStrip,
  args: {
    load: [
      { document: BriefingDocument.Cabin, label: "Cabin and manifest", href: "#cabin" },
      { document: BriefingDocument.Cargo, label: "Cargo", href: "#cargo" },
    ],
    records: [
      { document: BriefingDocument.Timesheet, label: "Timesheet", href: "#timesheet" },
      { document: BriefingDocument.Activity, label: "Activity log", href: "#activity" },
      { document: BriefingDocument.Delay, label: "Delay report", href: "#delay" },
    ],
    canDeclareEmergency: true,
    canReportDiversion: true,
    onDeclareEmergency: fn(),
    onReportDiversion: fn(),
  },
  parameters: {
    docs: {
      description: {
        component:
          "The bottom bar of the Briefing view from `md` up, and the end of the page below it: the load documents, the flight's records, and the two abnormal actions. Declare emergency and Report diversion open today's forms, and only between off-block and on-block.",
      },
    },
  },
} satisfies Meta<typeof BriefingRecordsStrip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const InFlight: Story = {
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Declare emergency" }));
    await expect(args.onDeclareEmergency).toHaveBeenCalled();
  },
};

export const BeforeOffBlock: Story = {
  args: { canDeclareEmergency: false, canReportDiversion: false },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("button", { name: "Report diversion" })).toBeDisabled();
  },
};

export const WithAnEmergencyOnRecord: Story = {
  args: {
    records: [
      { document: BriefingDocument.Timesheet, label: "Timesheet", href: "#timesheet" },
      { document: BriefingDocument.Activity, label: "Activity log", href: "#activity" },
      { document: BriefingDocument.Delay, label: "Delay report", href: "#delay" },
      { document: BriefingDocument.Emergencies, label: "Emergencies and diversions", href: "#emergencies" },
    ],
    canDeclareEmergency: false,
  },
};
