import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { expect, within } from "storybook/test";
import { FlightStatus } from "~/features/flight";
import { FlightRecords } from "~/features/flight/components/Briefing/FlightRecords";
import { BriefingDocument } from "~/features/flight/lib/briefingPhase";
import { TrackingView } from "~/features/flight/lib/trackingView";
import { briefingView, natApi, natFlight, trackingMapView } from "../../fixtures/briefing";
import { withApi } from "../../support/api";
import { NAT_STATUSES, type NatArgs, onNatFlight } from "../../support/briefing";
import { withBottomBar } from "../../support/shell";

type RecordsArgs = NatArgs & { view: TrackingView; document: BriefingDocument | null };

function Records({ status, view, document }: RecordsArgs) {
  const flight = natFlight(status);
  const trackingView = view === TrackingView.Tracking ? trackingMapView(flight, document) : briefingView(flight);

  return <FlightRecords trackingView={{ ...trackingView, document }} />;
}

const meta = {
  title: "Tracking/Briefing/Flight records",
  component: Records,
  decorators: [onNatFlight, withApi(natApi), withBottomBar],
  args: {
    status: FlightStatus.InCruise,
    reports: 0,
    view: TrackingView.Tracking,
    document: null,
  },
  argTypes: {
    status: { control: "select", options: NAT_STATUSES },
    view: { control: "inline-radio", options: Object.values(TrackingView) },
    document: { control: "select", options: [null, ...Object.values(BriefingDocument)] },
  },
  parameters: {
    docs: {
      description: {
        component:
          "The flight page's bottom bar on both views: Load, Records, Declare emergency and Report diversion, at the end of the page below `md`. Its documents open in the side panel over the view the pilot is on, so the Tracking map stays behind the timesheet. LH82, seeded.",
      },
    },
  },
} satisfies Meta<typeof Records>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OnTheTrackingMap: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Declare emergency" })).toBeEnabled();
    await expect(canvas.getByRole("link", { name: "Timesheet" })).toHaveAttribute(
      "href",
      expect.stringMatching(/\/tracking\?document=timesheet$/),
    );
  },
};

export const BeforeOffBlock: Story = {
  args: { status: FlightStatus.CheckedIn },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("button", { name: "Declare emergency" })).toBeDisabled();
  },
};

export const TimesheetOpenOverTheMap: Story = {
  args: { document: BriefingDocument.Timesheet },
  parameters: {
    layout: "fullscreen",
    docs: { story: { inline: false, iframeHeight: 640 } },
  },
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement.ownerDocument.body).findByRole("dialog")).toBeVisible();
  },
};
