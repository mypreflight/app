import type { Meta, StoryObj } from "@storybook/react-vite";
import { PhaseStateBadge } from "~/features/flight/components/Briefing/PhaseStateBadge";

const meta = {
  title: "Tracking/Briefing/Phase state badge",
  component: PhaseStateBadge,
  args: { state: "now" },
  argTypes: {
    state: { control: "inline-radio", options: ["done", "now", "next"] },
  },
  parameters: {
    docs: {
      description: {
        component: "Marks a briefing phase as done or as the one the flight is in. A phase still ahead shows nothing.",
      },
    },
  },
} satisfies Meta<typeof PhaseStateBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Now: Story = {};

export const Done: Story = {
  args: { state: "done" },
};
