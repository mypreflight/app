import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { type Flight, type FlightPathElement, FlightStatus } from "~/features/flight";
import { ProfileReadout } from "~/features/flight/components/Dashboard/History/Map/ProfileReadout";
import { VerticalProfile } from "~/features/flight/components/Profile/VerticalProfile";
import { flightFixture, flownTrack, recordedTrack } from "../fixtures/flights";
import { atWidth, CARD_WIDTHS, onCard } from "../support/frames";

type Props = {
  flight: Flight;
  track: FlightPathElement[];
};

function Profile({ flight, track }: Props) {
  const [cursor, setCursor] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-2">
      <ProfileReadout path={track} point={cursor === null ? null : track[cursor]} />
      <VerticalProfile path={track} timesheet={flight.timesheet} cursorIndex={cursor} onCursorChange={setCursor} />
    </div>
  );
}

const longHaul = flightFixture({ route: "longHaul", status: FlightStatus.Closed, delayMinutes: 6 });
const shortHaul = flightFixture({ route: "short", status: FlightStatus.Closed });

const meta = {
  title: "History/Vertical profile",
  component: Profile,
  decorators: [onCard, atWidth(CARD_WIDTHS.desktop)],
  parameters: {
    docs: {
      description: {
        component: `
Altitude (Signal Indigo Mark, filled) and ground speed (grey line) of a recorded ADS-B track over UTC, from the
actual off-block to the actual on-block. Taxi out and taxi in are shaded. The left axis is in flight levels, the right
one tops out at the fastest ground speed rounded up to 100 kt; hour ticks thin out to keep 96 px between them.

The chart is a slider: pointing at it, or focusing it and pressing the arrow keys, Page Up/Down, Home or End, picks the
nearest recorded point. On the history page that point moves the aircraft on the map. Escape or leaving the chart
clears it, and the readout falls back to the highest altitude and fastest ground speed.`,
      },
    },
  },
} satisfies Meta<typeof Profile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LongHaul: Story = {
  args: { flight: longHaul, track: flownTrack(longHaul) },
  parameters: {
    docs: { description: { story: "A synthetic nine-hour track with a step climb from FL350 to FL370." } },
  },
  play: async ({ canvasElement }) => {
    const profile = within(canvasElement).getByRole("slider", { name: "Vertical profile" });
    profile.focus();
    await userEvent.keyboard("{End}");
    await expect(profile).toHaveAttribute("aria-valuetext", expect.stringContaining("ft"));
  },
};

export const SparseTrack: Story = {
  args: { flight: shortHaul, track: recordedTrack },
  parameters: {
    docs: {
      description: { story: "Six recorded points from the seeded BOS to PHL flight; the lines join them straight." },
    },
  },
};

export const Phone: Story = {
  args: { flight: longHaul, track: flownTrack(longHaul) },
  decorators: [atWidth(CARD_WIDTHS.phone)],
  parameters: {
    docs: { description: { story: "At phone width only the edge times and every few hours stay labelled." } },
  },
};
