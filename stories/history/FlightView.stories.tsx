import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { type Flight, type FlightPathElement, FlightStatus, type Loadsheets } from "~/features/flight";
import { FlightHistoryHeader } from "~/features/flight/components/Dashboard/History/Header/FlightHistoryHeader";
import { HistoryMapBox } from "~/features/flight/components/Dashboard/History/Map/HistoryMapBox";
import { FlightRecordCard } from "~/features/flight/components/Dashboard/History/Record/FlightRecordCard";
import { HistoryFlightContext } from "~/features/flight/hooks/useHistoryFlight";
import { HistoryView, historyFlightPath } from "~/features/flight/lib/historyView";
import { RouteBriefingContext, type RouteBriefingState } from "~/features/route/hooks/useRouteBriefing";
import { useCoveredHeight } from "~/shared/hooks/useCoveredHeight";
import { flightFixture, flownTrack } from "../fixtures/flights";
import { briefingWaypoints, historyFlight, loadsheetsWithTrip } from "../fixtures/history";
import { polarBriefing, routeBriefingState } from "../fixtures/routes";

type Props = {
  flight: Flight;
  track: FlightPathElement[];
  loadsheets: Loadsheets;
  route: RouteBriefingState | null;
};

function FlightView({ flight, track, loadsheets, route }: Props) {
  const cover = useCoveredHeight<HTMLDivElement, HTMLDivElement>(true);
  const views = [
    { key: HistoryView.History, label: "History", to: historyFlightPath(flight.id) },
    { key: HistoryView.Documents, label: "Documents", to: historyFlightPath(flight.id, HistoryView.Documents) },
  ];

  return (
    <HistoryFlightContext.Provider value={historyFlight(flight, track, loadsheets)}>
      <RouteBriefingContext.Provider value={route}>
        <div className="relative h-[56rem] overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-950">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10">
            <div className="mx-auto max-w-7xl p-6 *:pointer-events-auto">
              <div ref={cover.coverRef} className="flex flex-col gap-3">
                <FlightHistoryHeader flight={flight} diversion={null} views={views} activeView={HistoryView.History} />
                <FlightRecordCard flight={flight} loadsheets={loadsheets} />
              </div>
            </div>
          </div>
          <HistoryMapBox ref={cover.targetRef} className="absolute inset-0" topInset={cover.coveredHeight} />
        </div>
      </RouteBriefingContext.Provider>
    </HistoryFlightContext.Provider>
  );
}

function closedFlight(options: Parameters<typeof flightFixture>[0], fuelBurned: number | null): Flight {
  const flight = flightFixture({ status: FlightStatus.Closed, ...options });
  flight.actualFuelBurned = fuelBurned;
  return flight;
}

const polarFlight = closedFlight({ route: "polar", delayMinutes: 12, blockDeltaMinutes: 18 }, 112.84);
const shortFlight = closedFlight({ route: "short", delayMinutes: -3 }, 6.92);
const unrecordedFlight = closedFlight({ route: "short" }, null);

const meta = {
  title: "History/Flight view",
  component: FlightView,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
A closed flight at \`/flight-history/:id\`: the Tracking screen frozen at on-block. \`FlightHistoryDashboard\` composes
these parts over a full-bleed map; the story lays them out the same way with fixed data.

1. **Header.** Identity, route with block time against schedule, the History / Documents switch, the date flown and
   arrival punctuality (on-block against schedule, five minutes either way counts as on time).
2. **Flight record.** Each block event's actual time with its scheduled time and the difference, block and air time,
   and fuel burned against the planned trip fuel from the loadsheet.
3. **Map.** The same flat or globe map as Tracking: great circle, filed route with clickable fixes, ETOPS rings,
   runways and stands, and the recorded ADS-B track.
4. **Vertical profile.** Altitude and ground speed over UTC, taxi spans shaded. Pointing at the profile, or focusing it
   and using the arrow keys, moves the aircraft along the track to that moment and shows its telemetry.

The tracks here are synthetic: generated along the route with a climb, a step climb, cruise and descent.`,
      },
    },
  },
} satisfies Meta<typeof FlightView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FiledPolarRoute: Story = {
  args: {
    flight: polarFlight,
    track: flownTrack(polarFlight, briefingWaypoints(polarBriefing)),
    loadsheets: loadsheetsWithTrip(108.6, 126.4),
    route: routeBriefingState(polarBriefing),
  },
  parameters: {
    docs: {
      description: {
        story: "A SimBrief flight with a filed route, flown late and burning more than planned.",
      },
    },
  },
};

export const ManualShortHaul: Story = {
  args: {
    flight: shortFlight,
    track: flownTrack(shortFlight),
    loadsheets: loadsheetsWithTrip(7.1, 9.6),
    route: null,
  },
  parameters: {
    docs: {
      description: {
        story: "A manual flight without a filed route: great circle and track only, arriving early under plan.",
      },
    },
  },
};

export const NoTrack: Story = {
  args: {
    flight: unrecordedFlight,
    track: [],
    loadsheets: { preliminary: null, final: null },
    route: null,
  },
  parameters: {
    docs: {
      description: {
        story:
          "No ADS-B track was recorded and no loadsheet was saved: the profile says so and fuel reads Not recorded.",
      },
    },
  },
};
