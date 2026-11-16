import type { Meta, StoryObj } from "@storybook/react-vite";
import { BriefingDocumentLink } from "~/features/flight/components/Briefing/BriefingDocumentLink";
import { BriefingDocument } from "~/features/flight/lib/briefingPhase";

const meta = {
  title: "Tracking/Briefing/Document link",
  component: BriefingDocumentLink,
  args: {
    entry: { document: BriefingDocument.Timesheet, label: "Timesheet", href: "#timesheet" },
    size: "xs",
  },
  argTypes: {
    size: { control: "inline-radio", options: ["xs", "sm"] },
  },
  parameters: {
    docs: {
      description: {
        component:
          "One document button. It is a link that adds the document to the address, so Back closes the panel, and it remembers that it opened the panel so closing returns focus to it.",
      },
    },
  },
} satisfies Meta<typeof BriefingDocumentLink>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Available: Story = {};

export const Unavailable: Story = {
  args: {
    entry: {
      document: BriefingDocument.Cabin,
      label: "Cabin and manifest",
      href: null,
      unavailableReason: "Cargo flights carry no passengers.",
    },
  },
};
