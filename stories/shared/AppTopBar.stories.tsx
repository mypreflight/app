import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { FlightTopBar } from "~/features/flight/components/Dashboard/Tracking/Header/FlightTopBar";
import { AppTopBar } from "~/shared/ui/Shell/AppTopBar";
import { briefingView, natFlight } from "../fixtures/briefing";

const ACCOUNT = { name: "Rick Doe", email: "cabin-crew@example.com" };

const meta = {
  title: "Shared/Shell/Top bar",
  component: AppTopBar,
  args: {
    account: ACCOUNT,
    discordInviteUrl: "https://discord.gg/example",
  },
  parameters: {
    docs: {
      description: {
        component:
          "The bar above the outlet, from `md` up. Its left side belongs to the page, which fills it through `ShellSlotPortal` with `ShellSlot.TopBar`; the account menu sits at its right end.",
      },
    },
  },
} satisfies Meta<typeof AppTopBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OnAFlightPage: Story = {
  render: (args) => {
    const flight = natFlight();

    return (
      <AppTopBar {...args}>
        <FlightTopBar flight={flight} diverted={false} trackingView={briefingView(flight)} />
      </AppTopBar>
    );
  },
};

export const WithoutPageContent: Story = {};
