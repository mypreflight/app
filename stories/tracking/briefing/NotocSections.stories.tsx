import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { expect, userEvent, within } from "storybook/test";
import { FlightStatus } from "~/features/flight";
import { NotocConfirmationStep } from "~/features/notoc/components/NotocConfirmationStep";
import type { FlightNotoc } from "~/features/notoc/model";
import { natFlight } from "../../fixtures/briefing";
import freighter from "../../fixtures/freighter-notoc.json";
import passenger from "../../fixtures/passenger-notoc.json";
import { withApi } from "../../support/api";

const freighterNotoc = freighter as unknown as FlightNotoc;
const passengerNotoc = passenger as unknown as FlightNotoc;

function serving(notoc: FlightNotoc) {
  return withApi({ notocService: { fetchByFlightId: async () => notoc } });
}

function Notoc() {
  return (
    <div className="max-w-2xl bg-white p-6 dark:bg-gray-900">
      <NotocConfirmationStep flight={natFlight(FlightStatus.CheckedIn)} />
    </div>
  );
}

const meta = {
  title: "Tracking/Briefing/NOTOC sections",
  component: Notoc,
  parameters: {
    docs: {
      description: {
        component:
          "The dangerous goods, special load and special category passenger sections of the digital NOTOC. Each opens by default and folds from its heading, which keeps the count. A folded section lists what it holds: dangerous goods by proper shipping name and whether any is cargo aircraft only, special loads by handling code, passengers by special service request with the seats under each. CV2020 and AA4906, seeded.",
      },
    },
  },
} satisfies Meta<typeof Notoc>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Freighter: Story = {
  decorators: [serving(freighterNotoc)],
  parameters: {
    docs: {
      description: {
        story:
          "A freighter carries dangerous goods, one of them cargo aircraft only, dry ice and special loads. Folding dangerous goods keeps the cargo aircraft only flag in view.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dangerousGoods = await canvas.findByRole("button", { name: /^dangerous goods/i });

    await expect(dangerousGoods).toHaveAttribute("aria-expanded", "true");
    await expect(canvas.getByText("Lithium ion batteries")).toBeVisible();

    await userEvent.click(dangerousGoods);

    await expect(dangerousGoods).toHaveAttribute("aria-expanded", "false");
    await expect(dangerousGoods).toHaveTextContent(
      /^dangerous goods3paint\s·\slithium ion batteries\s·\sdry icecargo aircraft only$/i,
    );
    await expect(canvas.queryByRole("button", { name: /emergency response drill/i })).toBeNull();

    const specialLoad = canvas.getByRole("button", { name: /^special load/i });
    await userEvent.click(specialLoad);

    await expect(specialLoad).toHaveTextContent(/^special load4avi\s·\shea\s·\sbig\s·\shum\s·\spil\s·\scol\s·\sact$/i);
    await expect(canvas.getByText("Live horses in air stalls")).not.toBeVisible();

    await userEvent.click(dangerousGoods);

    await expect(dangerousGoods).toHaveAttribute("aria-expanded", "true");
    await expect(canvas.getByText("Lithium ion batteries")).toBeVisible();
  },
};

export const PassengerFlight: Story = {
  decorators: [serving(passengerNotoc)],
  parameters: {
    docs: {
      description: {
        story:
          "A passenger flight with no dangerous goods states so without a fold. Folded, its 43 special category passengers read as twelve service requests with their seat counts.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const passengers = await canvas.findByRole("button", { name: /^special category passengers/i });

    await expect(canvas.getByText("No dangerous goods loaded")).toBeInTheDocument();
    await expect(canvas.queryByRole("button", { name: /^dangerous goods/i })).toBeNull();

    await userEvent.click(passengers);

    await expect(passengers).toHaveTextContent(/^special category passengers43/i);
    await expect(passengers).toHaveTextContent(/inft\s×17/i);
    await expect(passengers).toHaveTextContent(/petc\s×4$/i);
    await expect(canvas.getByText("Infant in arms")).not.toBeVisible();
  },
};
