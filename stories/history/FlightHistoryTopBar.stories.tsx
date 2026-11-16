import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { FlightStatus } from "~/features/flight";
import { FlightHistoryTopBar } from "~/features/flight/components/Dashboard/History/Header/FlightHistoryTopBar";
import { HistoryView, historyFlightPath } from "~/features/flight/lib/historyView";
import { flightFixture, type RouteFixture } from "../fixtures/flights";
import { atWidth } from "../support/frames";

type TopBarArgs = {
  route: RouteFixture;
  diverted: boolean;
};

const meta = {
  title: "History/Flight top bar",
  render: ({ route, diverted }) => {
    const flight = flightFixture({ route, status: FlightStatus.Closed, delayMinutes: 30 });
    const views = [
      { key: HistoryView.History, label: "History", to: historyFlightPath(flight.id) },
      { key: HistoryView.Documents, label: "Documents", to: historyFlightPath(flight.id, HistoryView.Documents) },
    ];

    return (
      <div className="flex items-center gap-5 rounded-2xl bg-white px-4 py-2 dark:bg-gray-900">
        <FlightHistoryTopBar flight={flight} diverted={diverted} views={views} activeView={HistoryView.History} />
      </div>
    );
  },
  args: {
    route: "longHaul",
    diverted: false,
  },
  argTypes: {
    route: { control: "inline-radio", options: ["short", "longHaul", "nat"] },
    diverted: { description: "Strikes the destination when the flight was diverted." },
  },
  parameters: {
    docs: {
      description: {
        component:
          "A closed flight's identity in the app's top bar: a link back to Flight history, the flight's fin, number, airport pair, cities and registration with the airframe, then the date it was flown, the Closed badge and the History and Documents switch. The cities drop out when the line runs short of room, since the airport pair already names the route. Below `md` the page keeps its own header instead.",
      },
    },
  },
} satisfies Meta<TopBarArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Closed: Story = {};

export const Diverted: Story = {
  args: { diverted: true },
};

export const Narrow: Story = {
  decorators: [atWidth(980)],
  parameters: {
    docs: { description: { story: "At a laptop's width the cities give way so the line stays on one row." } },
  },
};
