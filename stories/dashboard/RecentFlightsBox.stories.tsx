import type { Meta, StoryObj } from "@storybook/react-vite";
import { type Flight, FlightStatus } from "~/features/flight";
import { RecentFlightsBox } from "~/features/flight/components/Dashboard/Main/Box/RecentFlightsBox";
import { flightFixture, type RouteFixture } from "../fixtures/flights";
import { atWidth, CARD_WIDTHS } from "../support/frames";

function closedFlight(route: RouteFixture, id: string, flightNumber: string): Flight {
  const flight = flightFixture({ route, status: FlightStatus.Closed });
  flight.id = id;
  flight.flightNumber = flightNumber;
  return flight;
}

const meta = {
  title: "Dashboard/Recent flights",
  component: RecentFlightsBox,
  decorators: [atWidth(CARD_WIDTHS.laptop)],
  args: {
    flights: [
      closedFlight("longHaul", "recent-long-haul", "LH40"),
      closedFlight("short", "recent-short", "AA4917"),
      closedFlight("polar", "recent-polar", "CX845"),
    ],
    failed: false,
  },
  argTypes: {
    flights: { control: false, description: "The pilot's three most recent finished flights, newest first." },
    failed: { description: "The recent flights could not be loaded." },
  },
  parameters: {
    docs: {
      description: {
        component: `
The pilot's three most recent finished flights, one line each: tail fin, flight number, route and the date flown.
Each line opens the flight; the footer opens the whole flight history.
`,
      },
    },
  },
} satisfies Meta<typeof RecentFlightsBox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ThreeFlights: Story = {};

export const NoFlights: Story = {
  args: { flights: [] },
};

export const LoadFailed: Story = {
  args: { flights: [], failed: true },
};
