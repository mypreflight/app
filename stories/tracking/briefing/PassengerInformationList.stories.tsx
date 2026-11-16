import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { PassengerInformationList } from "~/features/flight/components/Briefing/PassengerInformationList";
import type { ManifestPassenger, SpecialServiceRequest } from "~/features/flight/model";
import { natManifest } from "../../fixtures/briefing";
import { atWidth, onCard } from "../../support/frames";

function Stateful({ passengers }: { passengers: ManifestPassenger[] }) {
  const [request, setRequest] = useState<SpecialServiceRequest | null>(null);

  return <PassengerInformationList passengers={passengers} request={request} onRequestChange={setRequest} />;
}

const meta = {
  title: "Tracking/Briefing/Passenger information list",
  component: Stateful,
  decorators: [onCard, atWidth(688)],
  args: { passengers: natManifest },
  argTypes: { passengers: { control: false } },
  parameters: {
    docs: {
      description: {
        component:
          "The PIL: every passenger with a special service request, by seat, with the request spelled out. The filter narrows it to one request. Seeded LH82 manifest, 348 passengers.",
      },
    },
  },
} satisfies Meta<typeof Stateful>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AllRequests: Story = {};

export const UnaccompaniedMinors: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /^UMNR/ }));

    const rows = canvas.getAllByRole("row").slice(1);
    await expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      await expect(row).toHaveTextContent("Unaccompanied minor");
    }
  },
};

export const NoRequests: Story = {
  args: { passengers: natManifest.map((passenger) => ({ ...passenger, ssr: null })) },
};
