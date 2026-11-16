import type { Meta, StoryObj } from "@storybook/react-vite";
import { PassengersSummaryCard } from "~/features/flight/components/Briefing/PassengersSummaryCard";
import { natManifest } from "../../fixtures/briefing";
import { atWidth } from "../../support/frames";

const meta = {
  title: "Tracking/Briefing/Passengers summary card",
  component: PassengersSummaryCard,
  decorators: [atWidth(380)],
  args: {
    passengers: natManifest,
    pilHref: (request) => (request === null ? "#pil" : `#pil-${request}`),
    cabinHref: "#cabin",
  },
  argTypes: {
    passengers: { control: false },
    pilHref: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Passengers in the preflight briefing: the count per cabin and the special requests by code. A code opens the PIL already filtered to it.",
      },
    },
  },
} satisfies Meta<typeof PassengersSummaryCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SeededManifest: Story = {};

export const NoSpecialRequests: Story = {
  args: { passengers: natManifest.map((passenger) => ({ ...passenger, ssr: null })) },
};
