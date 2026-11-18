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
    flight: { control: false, description: "The pilot's next ready flight." },
    failed: { description: "The upcoming flights could not be loaded." },
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
The pilot's next ready flight. With nothing scheduled it shows the shape that flight will take instead of a blank
placeholder: the departure filled in when the app knows it, and dashed slots for whatever Operations has yet to decide.
While the pilot has no flight in progress, the card also imports their latest SimBrief plan, or asks for a SimBrief ID
first.
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
    docs: { description: { story: "The upcoming flights failed to load. The card says so, never an empty state." } },
  },
  play: async ({ canvas }) => {
    await expect(canvas.queryByText("Awaiting dispatch")).toBeNull();
  },
};

export const ScheduledWithImport: Story = {
  args: { flight: flightFromNewYork(), simbriefImport: { hasSimbriefId: true, open: fn() } },
  parameters: {
    docs: {
      description: {
        story: "No flight in progress: the pilot can import their own plan beside the flight Operations dispatched.",
      },
    },
  },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Import from SimBrief" }));
    await expect(args.simbriefImport?.open).toHaveBeenCalled();
  },
};

export const NothingScheduledWithImport: Story = {
  args: { departure: groundStopAfterFlight().airport, simbriefImport: { hasSimbriefId: true, open: fn() } },
  parameters: {
    docs: {
      description: {
        story: "Nothing is scheduled and no flight is in progress, so the card offers the import instead of waiting.",
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("No flight scheduled")).toBeVisible();
    await expect(canvas.queryByText("Awaiting dispatch")).toBeNull();
    await expect(canvas.getByRole("button", { name: "Import from SimBrief" })).toBeVisible();
  },
};

export const NothingScheduledWithoutSimbriefId: Story = {
  args: { departure: groundStopAfterFlight().airport, simbriefImport: { hasSimbriefId: false, open: fn() } },
  parameters: {
    docs: {
      description: { story: "The pilot hasn't added a SimBrief ID yet, so the card links to the account page." },
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "Add your SimBrief ID" })).toHaveAttribute("href", "/me/account");
  },
};
