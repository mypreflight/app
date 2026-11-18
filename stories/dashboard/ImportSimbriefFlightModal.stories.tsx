import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { ImportSimbriefFlightModal } from "~/features/flight/components/Modal/ImportSimbriefFlightModal";
import type { SimbriefAccount } from "~/features/user";
import { withApi } from "../support/api";

const latestPlan: SimbriefAccount = {
  simbriefUserId: "123456",
  latestFlight: {
    callsign: "DLH80",
    origin: { icaoCode: "EDDF", iataCode: "FRA", name: "FRANKFURT/MAIN" },
    destination: { icaoCode: "KJFK", iataCode: "JFK", name: "NEW YORK JFK" },
    scheduledOffBlockTime: "2026-01-05T09:00:00.000Z",
    scheduledOnBlockTime: "2026-01-05T17:25:00.000Z",
    aircraft: { registration: "D-AIMC", type: "A339", name: "A330-900" },
    generatedAt: "2026-01-05T06:12:00.000Z",
  },
};

const meta = {
  title: "Dashboard/Next scheduled flight/Import from SimBrief",
  component: ImportSimbriefFlightModal,
  decorators: [
    withApi({
      userService: { verifySimbriefUser: async () => latestPlan },
    }),
  ],
  args: {
    simbriefUserId: "123456",
    imported: fn(),
    close: fn(),
  },
  parameters: {
    docs: {
      description: {
        component:
          "Opened from the Next scheduled flight card while the pilot has no flight in progress. It shows the latest plan in the pilot's SimBrief account, so they can tell it's the one they just generated, then imports it and checks them in with the plan's estimated times.",
      },
    },
  },
} satisfies Meta<typeof ImportSimbriefFlightModal>;

export default meta;

type Story = StoryObj<typeof meta>;

export const LatestPlan: Story = {
  parameters: {
    docs: { description: { story: "The plan loaded from SimBrief: DLH80 from Frankfurt to New York on D-AIMC." } },
  },
  play: async () => {
    const body = within(document.body);

    await expect(await body.findByText("EDDF → KJFK")).toBeInTheDocument();
    await expect(body.getByText("A330-900 · D-AIMC")).toBeInTheDocument();
  },
};

export const PreviewUnavailable: Story = {
  decorators: [
    withApi({
      userService: { verifySimbriefUser: async () => Promise.reject({ statusCode: 502 }) },
    }),
  ],
  parameters: {
    docs: {
      description: { story: "SimBrief didn't answer the preview. The import stays available, because it asks again." },
    },
  },
  play: async () => {
    const body = within(document.body);

    await expect(
      await body.findByText("Your latest plan couldn’t be previewed. You can still import it."),
    ).toBeInTheDocument();
    await expect(body.getByRole("button", { name: "Import and check in" })).toBeEnabled();
  },
};

export const ImportRefused: Story = {
  decorators: [
    withApi({
      userService: { verifySimbriefUser: async () => latestPlan },
      flightService: {
        importFlightFromSimbrief: async () =>
          Promise.reject({ statusCode: 404, message: "Operator with given ICAO code not found." }),
      },
    }),
  ],
  parameters: {
    docs: {
      description: {
        story: "The plan's airline isn't in MyPreflight, so the import is refused and the modal says why.",
      },
    },
  },
  play: async ({ args }) => {
    const body = within(document.body);

    await body.findByText("EDDF → KJFK");
    await userEvent.click(body.getByRole("button", { name: "Import and check in" }));

    await expect(await body.findByRole("alert")).toHaveTextContent("MyPreflight doesn’t have this plan’s airline yet.");
    await expect(args.imported).not.toHaveBeenCalled();
  },
};
