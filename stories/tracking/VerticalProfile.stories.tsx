import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import type { Flight, FlightPathElement } from "~/features/flight";
import { FlightProfilePanel } from "~/features/flight/components/Profile/FlightProfilePanel";
import { ProfileReadout } from "~/features/flight/components/Profile/ProfileReadout";
import { plannedProfile } from "~/features/flight/lib/verticalProfile";
import { natBriefing, natFlight, takeoffOf } from "../fixtures/briefing";
import { syntheticTrack } from "../fixtures/flights";
import { atWidth, CARD_WIDTHS } from "../support/frames";

type Props = {
  flight: Flight;
  track: FlightPathElement[];
};

function LiveProfile({ flight, track }: Props) {
  const [cursor, setCursor] = useState<number | null>(null);
  const planned = plannedProfile(natBriefing.route.fixes, takeoffOf(flight));

  return (
    <FlightProfilePanel
      controls={null}
      readout={<ProfileReadout path={track} point={cursor === null ? null : track[cursor]} idle="latest" />}
      path={track}
      timesheet={flight.timesheet}
      planned={planned}
      cursorIndex={cursor}
      onCursorChange={setCursor}
    />
  );
}

const inCruise = natFlight();

const meta = {
  title: "Tracking/Vertical profile",
  component: LiveProfile,
  decorators: [atWidth(1040)],
  parameters: {
    docs: {
      description: {
        component: `
The vertical profile docked at the bottom of the Tracking view's map, the same panel the flight history page uses. It
draws the flight plan's altitude dashed from the expected takeoff, and the live ADS-B track over it as it comes in, so
a flight that has not taken off yet shows only the plan. Without a pointer on the chart the readout shows the latest
altitude, ground speed, track and vertical speed.

The time axis zooms: the wheel or a trackpad pinch over the chart zooms around the pointer, two fingers pinch on a
touch screen, and dragging with the mouse or a sideways scroll pans a zoomed chart. The buttons halve or double the
time shown around the middle, and the third shows the whole flight again. With the chart focused, + and − zoom around
the picked point, 0 shows the whole flight, and the arrow keys pan the chart along with the picked point.`,
      },
    },
  },
} satisfies Meta<typeof LiveProfile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InCruise: Story = {
  args: { flight: inCruise, track: syntheticTrack(inCruise, 0.45) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const whole = canvas.getByRole("button", { name: "Show the whole flight" });
    await expect(whole).toBeDisabled();
    await userEvent.click(canvas.getByRole("button", { name: "Zoom in" }));
    await expect(whole).toBeEnabled();
    await userEvent.click(whole);
    await expect(whole).toBeDisabled();
  },
};

export const BeforeTakeoff: Story = {
  args: { flight: inCruise, track: [] },
  parameters: {
    docs: { description: { story: "Before the aircraft reports a position, the plan alone." } },
  },
};

export const Phone: Story = {
  args: { flight: inCruise, track: syntheticTrack(inCruise, 0.45) },
  decorators: [atWidth(CARD_WIDTHS.phone)],
};
