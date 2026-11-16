import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { BriefingDocumentButtons } from "~/features/flight/components/Briefing/BriefingDocumentButtons";
import { BriefingPhaseHeader } from "~/features/flight/components/Briefing/BriefingPhaseHeader";
import { BriefingDocument } from "~/features/flight/lib/briefingPhase";

const meta = {
  title: "Tracking/Briefing/Phase header",
  component: BriefingPhaseHeader,
  args: {
    title: "Oceanic crossing",
    summary: "Track E · TMI 246 · EGGX",
  },
  parameters: {
    docs: {
      description: {
        component:
          "Names the phase on screen with a one-line summary, and carries the document buttons on its right. On a narrow screen the buttons wrap below the title.",
      },
    },
  },
} satisfies Meta<typeof BriefingPhaseHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithDocuments: Story = {
  render: (args) => (
    <BriefingPhaseHeader {...args}>
      <BriefingDocumentButtons
        documents={[
          { document: BriefingDocument.NavLog, label: "Nav log", href: "#nav-log" },
          { document: BriefingDocument.Ofp, label: "OFP", href: "#ofp" },
          { document: BriefingDocument.RunwayAnalysis, label: "Runway analysis", href: "#runway-analysis" },
          { document: BriefingDocument.Notoc, label: "NOTOC", href: "#notoc" },
          { document: BriefingDocument.Pil, label: "PIL", href: "#pil" },
        ]}
      />
    </BriefingPhaseHeader>
  ),
};

export const TitleOnly: Story = {
  args: { title: "Preflight briefing", summary: "Frankfurt · off-block 09:00Z" },
};
