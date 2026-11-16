import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { BriefingDocumentDrawer } from "~/features/flight/components/Briefing/BriefingDocumentDrawer";

const meta = {
  title: "Tracking/Briefing/Document panel",
  component: BriefingDocumentDrawer,
  args: {
    title: "Runway analysis",
    width: "document",
    onClose: fn(),
    children: <p className="font-mono text-sm">EDDF 07C · 4,000 m × 60 m · 072° M · asphalt · elevation 111 m</p>,
  },
  argTypes: {
    width: { control: "inline-radio", options: ["document", "wide"] },
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      story: { inline: false, iframeHeight: 420 },
      description: {
        component:
          "The panel every briefing document opens in, from the right over a dimmed page. Focus moves into it when it opens; Escape, the close button or a click on the page closes it, and focus returns to the button that opened it. Cabin, Cargo and Emergencies use the wide panel.",
      },
    },
  },
} satisfies Meta<typeof BriefingDocumentDrawer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Document: Story = {
  play: async ({ canvasElement, args }) => {
    const body = within(canvasElement.ownerDocument.body);
    await expect(body.getByRole("dialog", { name: "Runway analysis" })).toHaveFocus();

    await userEvent.keyboard("{Escape}");
    await expect(args.onClose).toHaveBeenCalled();
  },
};

export const Wide: Story = {
  args: { title: "Cabin and manifest", width: "wide" },
};
