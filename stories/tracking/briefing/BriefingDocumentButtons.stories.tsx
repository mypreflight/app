import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { BriefingDocumentButtons } from "~/features/flight/components/Briefing/BriefingDocumentButtons";
import { BriefingDocument } from "~/features/flight/lib/briefingPhase";

const SIMBRIEF_ONLY = "Available for flights planned with SimBrief.";

const meta = {
  title: "Tracking/Briefing/Document buttons",
  component: BriefingDocumentButtons,
  args: {
    documents: [
      { document: BriefingDocument.NavLog, label: "Nav log", href: "#nav-log" },
      { document: BriefingDocument.Ofp, label: "OFP", href: "#ofp" },
      { document: BriefingDocument.RunwayAnalysis, label: "Runway analysis", href: "#runway-analysis" },
      { document: BriefingDocument.Notoc, label: "NOTOC", href: "#notoc" },
      { document: BriefingDocument.Pil, label: "PIL", href: "#pil" },
    ],
  },
  parameters: {
    docs: {
      description: {
        component:
          "The documents a crew reads beside the phase: each opens in the side panel. A document the flight cannot have is disabled, and its tooltip says why.",
      },
    },
  },
} satisfies Meta<typeof BriefingDocumentButtons>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SimBriefFlight: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getAllByRole("link")).toHaveLength(5);
  },
};

export const ManualFlight: Story = {
  args: {
    documents: [
      { document: BriefingDocument.NavLog, label: "Nav log", href: null, unavailableReason: SIMBRIEF_ONLY },
      { document: BriefingDocument.Ofp, label: "OFP", href: null, unavailableReason: SIMBRIEF_ONLY },
      {
        document: BriefingDocument.RunwayAnalysis,
        label: "Runway analysis",
        href: null,
        unavailableReason: SIMBRIEF_ONLY,
      },
      { document: BriefingDocument.Notoc, label: "NOTOC", href: "#notoc" },
      { document: BriefingDocument.Pil, label: "PIL", href: "#pil" },
    ],
  },
};
