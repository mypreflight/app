import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { NextScheduledFlightBox } from "~/features/flight/components/Dashboard/Main/Box/NextScheduledFlightBox";
import { flightFromNewYork, groundStopAfterFlight } from "../fixtures/groundStops";
import { atWidth, CARD_WIDTHS } from "../support/frames";

const meta = {
  title: "Dashboard/Next scheduled flight/Card",
  component: NextScheduledFlightBox,
  decorators: [atWidth(CARD_WIDTHS.laptop)],
  args: {
    flight: null,
    failed: false,
    departure: null,
    simbriefImport: null,
  },
  argTypes: {
    flight: {
      control: false,
      description: "The earliest ready flight in a rotation Operations released to the pilot.",
    },
    failed: { description: "The next flight could not be loaded." },
    departure: {
      control: false,
      description:
        "Where the next flight will start from when none is scheduled yet: the current flight's destination, or the airport the pilot is at.",
    },
    simbriefImport: {
      control: false,
      description:
        "Set while the pilot has no flight in progress: whether they added a SimBrief ID, and what opens the import.",
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
The earliest ready flight in a rotation Operations released to the pilot. With nothing scheduled it shows the shape
that flight will take instead of a blank placeholder: the departure filled in when the app knows it, and dashed slots for
the rest. While the pilot has no flight in progress and nothing is scheduled for them, it imports their latest SimBrief
plan, or asks for a SimBrief ID first.
`,
      },
    },
  },
} satisfies Meta<typeof NextScheduledFlightBox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Scheduled: Story = {
  args: { flight: flightFromNewYork() },
  parameters: {
    docs: { description: { story: "A ready flight exists, with its route and scheduled times." } },
  },
};

export const AwaitingDispatch: Story = {
  args: { departure: groundStopAfterFlight().airport },
  parameters: {
    docs: {
      description: { story: "Nothing is scheduled and the pilot's location is known, so the departure is filled in." },
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Awaiting dispatch")).toBeVisible();
    await expect(canvas.getByText("JFK")).toBeVisible();
  },
};

export const AwaitingDispatchLocationUnknown: Story = {
  parameters: {
    docs: {
      description: {
        story: "Nothing is scheduled and the pilot has no known location yet, such as a new account with no travels.",
      },
    },
  },
};

export const Unavailable: Story = {
  args: { failed: true },
  parameters: {
    docs: { description: { story: "The next flight failed to load. The card says so, never an empty state." } },
  },
  play: async ({ canvas }) => {
    await expect(canvas.queryByText("Awaiting dispatch")).toBeNull();
  },
};

export const ScheduledLeavesImportOut: Story = {
  args: { flight: flightFromNewYork(), simbriefImport: { hasSimbriefId: true, open: fn() } },
  parameters: {
    docs: {
      description: {
        story: "Operations scheduled the pilot's next flight, so the card offers no import beside it.",
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.queryByText("Import from SimBrief")).toBeNull();
  },
};

export const NothingScheduledWithImport: Story = {
  args: { simbriefImport: { hasSimbriefId: true, open: fn() } },
  parameters: {
    docs: {
      description: {
        story: "Nothing is scheduled and no flight is in progress, so the card asks the pilot to import their plan.",
      },
    },
  },
  play: async ({ canvas, args }) => {
    await expect(canvas.getByText("No flight scheduled")).toBeVisible();
    await expect(canvas.queryByText("Awaiting dispatch")).toBeNull();
    await userEvent.click(canvas.getByRole("button", { name: "Import from SimBrief" }));
    await expect(args.simbriefImport?.open).toHaveBeenCalled();
  },
};

export const NothingScheduledWithoutSimbriefId: Story = {
  args: { simbriefImport: { hasSimbriefId: false, open: fn() } },
  parameters: {
    docs: {
      description: {
        story: "A new pilot without a SimBrief ID. The button opens the SimBrief connection right on the dashboard.",
      },
    },
  },
  play: async ({ canvas, args }) => {
    await expect(canvas.getByText("Add your SimBrief ID in order to import your first flight plan.")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Add SimBrief ID" }));
    await expect(args.simbriefImport?.open).toHaveBeenCalled();
  },
};

export const NothingScheduledOnPhone: Story = {
  args: { simbriefImport: { hasSimbriefId: false, open: fn() } },
  decorators: [atWidth(CARD_WIDTHS.phone)],
  parameters: {
    docs: { description: { story: "The same prompt at phone width, where it's the first flight card." } },
  },
};
