import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { FlightStatus } from "~/features/flight";
import { FlightTopBar } from "~/features/flight/components/Dashboard/Tracking/Header/FlightTopBar";
import { briefingView } from "../../fixtures/briefing";
import { flightFixture, type RouteFixture } from "../../fixtures/flights";

type TopBarArgs = {
  route: RouteFixture;
  status: FlightStatus;
  diverted: boolean;
};

const meta = {
  title: "Tracking/Briefing/Flight top bar",
  render: ({ route, status, diverted }) => {
    const flight = flightFixture({ route, status });

    return (
      <div className="flex items-center gap-5 rounded-2xl bg-white px-4 py-2 dark:bg-gray-900">
        <FlightTopBar flight={flight} diverted={diverted} trackingView={briefingView(flight)} />
      </div>
    );
  },
  args: {
    route: "nat",
    status: FlightStatus.InCruise,
    diverted: false,
  },
  argTypes: {
    route: { control: "inline-radio", options: ["short", "longHaul", "nat"] },
    status: { control: "select", options: Object.values(FlightStatus) },
    diverted: { description: "Strikes the destination when a diversion has been reported." },
  },
  parameters: {
    docs: {
      description: {
        component:
          "The flight's identity on one line in the app's top bar: fin, flight number, airport pair, cities with the block time, registration with the airframe, and a compact Briefing and Tracking switch. Below `md` the page keeps its own header instead.",
      },
    },
  },
} satisfies Meta<TopBarArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const InCruise: Story = {};

export const BeforeDeparture: Story = {
  args: { status: FlightStatus.CheckedIn },
};

export const Diverted: Story = {
  args: { diverted: true },
};
