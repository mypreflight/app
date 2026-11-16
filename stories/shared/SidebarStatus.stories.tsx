import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { expect, within } from "storybook/test";
import { AdsbProvider } from "~/features/adsb/hooks/useAdsbData";
import { FlightQuickStatus } from "~/features/flight/components/Dashboard/Tracking/Header/FlightQuickStatus";
import { TrackedFlightContext } from "~/features/flight/hooks/useTrackedFlight";
import { SidebarStatus } from "~/shared/ui/Sidebar/Elements/SidebarStatus";
import { natFlight, natTrackedFlight } from "../fixtures/briefing";

const meta = {
  title: "Shared/Shell/Sidebar status",
  component: SidebarStatus,
  args: {
    version: "2.130.0",
  },
  decorators: [
    (Story) => (
      <div className="w-60 px-4">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "The foot of the sidebar, from `md` up: whatever readings the page adds through `ShellSlotPortal` with `ShellSlot.SidebarStatus`, then the app version and the changelog. The flight page adds its AOC and ADS-B readings.",
      },
    },
  },
} satisfies Meta<typeof SidebarStatus>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OnAFlightPage: Story = {
  render: (args) => (
    <TrackedFlightContext.Provider value={natTrackedFlight(natFlight())}>
      <AdsbProvider>
        <SidebarStatus {...args}>
          <FlightQuickStatus stacked={true} />
        </SidebarStatus>
      </AdsbProvider>
    </TrackedFlightContext.Provider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("AOC")).toBeVisible();
    await expect(canvas.getByText("ADS-B")).toBeVisible();
  },
};

export const VersionOnly: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("link", { name: "What’s new" })).toHaveAttribute("target", "_blank");
  },
};
