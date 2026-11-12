import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { fn } from "storybook/test";
import { type Flight, FlightStatus } from "~/features/flight";
import { FlightHistoryPanel } from "~/features/flight/components/List/History/FlightHistoryPanel";
import { FlightHistoryStage } from "~/features/flight/components/List/History/FlightHistoryStage";
import {
  FlightHistoryStageContext,
  type FlightHistoryStage as FlightHistoryStageValue,
  type HistoryListStatus,
} from "~/features/flight/hooks/useFlightHistoryStage";
import { historyTrack } from "~/features/flight/lib/historyOverview";
import { flightFixture, flownTrack } from "../fixtures/flights";

function closedFlight(route: "short" | "longHaul" | "polar", id: string, flightNumber: string): Flight {
  const flight = flightFixture({ route, status: FlightStatus.Closed });
  flight.id = id;
  flight.flightNumber = flightNumber;
  return flight;
}

const shortFlight = closedFlight("short", "history-short", "AA4905");
const longHaulFlight = closedFlight("longHaul", "history-long-haul", "LH400");
const unrecordedFlight = closedFlight("polar", "history-unrecorded", "CX845");
const FLIGHTS = [shortFlight, longHaulFlight, unrecordedFlight];
const TRACKS = new Map([
  [shortFlight.id, historyTrack(shortFlight, flownTrack(shortFlight))],
  [longHaulFlight.id, historyTrack(longHaulFlight, flownTrack(longHaulFlight))],
  [unrecordedFlight.id, historyTrack(unrecordedFlight, null)],
]);
const PANEL_INSET = 376;

type Props = {
  status: HistoryListStatus;
  flights: Flight[];
  hovered: string | null;
};

function FlightHistoryList({ status, flights, hovered }: Props) {
  const [hoveredId, setHoveredId] = useState(hovered);
  const value: FlightHistoryStageValue = {
    flights,
    totalCount: flights.length,
    status,
    hasMore: false,
    isLoadingMore: false,
    moreFailed: false,
    loadMore: fn(),
    retry: fn(),
    tracks: TRACKS,
    hoveredId,
    setHoveredId,
    selectedId: null,
    open: fn(),
    readListScroll: () => 0,
    rememberListScroll: fn(),
    handoff: null,
    returnCamera: null,
    rememberStageCamera: fn(),
    panelInset: PANEL_INSET,
    setPanelInset: fn(),
    flightInsets: null,
    completeHandoff: fn(),
    cachedFlight: () => null,
    cachedPath: () => null,
    rememberFlightCamera: fn(),
    reportFlightInsets: fn(),
  };

  return (
    <FlightHistoryStageContext.Provider value={value}>
      <div className="relative h-[44rem] overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-950">
        <FlightHistoryStage parked={false} />
        <FlightHistoryPanel leaving={false} parked={false} />
      </div>
    </FlightHistoryStageContext.Provider>
  );
}

const meta = {
  title: "History/Flight history list",
  component: FlightHistoryList,
  args: { status: "ready", flights: FLIGHTS, hovered: null },
  argTypes: {
    status: { control: "inline-radio", options: ["loading", "ready", "failed"] },
    flights: { control: false },
    hovered: { control: false, description: "The flight pointed at, in the list or on the globe." },
  },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
\`/flight-history\`: closed flights in a narrow list over a full-bleed globe, ten at a time, the next ten loading as the
list scrolls to its end.

- **List.** Fin, flight number, route and the date flown, newest first. Pointing at or focusing a row highlights its
  flight on the globe; a click opens the flight.
- **Globe.** Every loaded flight as a grey line: the recorded track, or the great circle dashed when nothing was
  recorded. The flight pointed at turns Signal Indigo with its two airport codes. The globe is centred in the space
  right of the list, framed on the first ten flights.
- **Opening a flight.** The list slides away, the other flights fade, the globe flies to the flight and the flight's
  header and vertical profile slide in; the flight page's own map takes over at the same camera.

Below 768px the globe is a card above the list and a tap opens the flight directly.

The tracks here are synthetic.`,
      },
    },
  },
} satisfies Meta<typeof FlightHistoryList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  args: { hovered: longHaulFlight.id },
  parameters: {
    docs: {
      description: {
        story:
          "Three closed flights, one pointed at: its track in Signal Indigo with both airports, the others grey, and the flight without a recorded track as a dashed great circle.",
      },
    },
  },
};

export const Loading: Story = {
  args: { status: "loading", flights: [] },
};

export const NoFlights: Story = {
  args: { flights: [] },
};

export const LoadFailed: Story = {
  args: { status: "failed", flights: [] },
};
