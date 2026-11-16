import type { Meta, StoryObj } from "@storybook/react-vite";
import { FlightStatus } from "~/features/flight";
import { FlightTimesheets } from "~/features/flight/components/Overview/FlightTimesheets";
import { NAT_STATUSES, type NatArgs, onNatFlight } from "../../support/briefing";
import { atWidth } from "../../support/frames";

const meta = {
  title: "Tracking/Briefing/Timesheets",
  component: FlightTimesheets,
  decorators: [onNatFlight, atWidth(640)],
  args: { status: FlightStatus.InCruise, reports: 0 } as NatArgs,
  argTypes: {
    status: { control: "select", options: NAT_STATUSES },
  },
  parameters: {
    docs: {
      description: {
        component:
          "The four timesheets of the Timesheet document: scheduled, estimated, predicted from the FMC and actual. Report predicted times appears while there is an event left to predict.",
      },
    },
  },
} satisfies Meta<typeof FlightTimesheets>;

export default meta;

type Story = StoryObj<typeof meta>;

export const InCruise: Story = {};

export const AfterCheckIn: Story = {
  args: { status: FlightStatus.CheckedIn } as NatArgs,
};
