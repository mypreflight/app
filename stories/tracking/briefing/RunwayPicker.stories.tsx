import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { AtisSource } from "~/features/airport";
import { SelectRunwayModal } from "~/features/flight/components/Modal/SelectRunwayModal";
import { frankfurtRunways, frankfurtWeather, natFlight } from "../../fixtures/briefing";
import assignments from "../../fixtures/frankfurt-departure-assignments.json";
import { withApi } from "../../support/api";

const frankfurt = natFlight().departureAirport;

const meta = {
  title: "Tracking/Briefing/Runway picker",
  component: SelectRunwayModal,
  decorators: [
    withApi({
      runwayService: { fetchAll: async () => frankfurtRunways as never },
      terminalService: { fetchAll: async () => assignments.terminals as never },
    }),
  ],
  args: {
    airport: frankfurt,
    kind: "departure",
    weather: { status: "ready", reports: frankfurtWeather },
    atisSource: null,
    currentSelectionId: assignments.runway.id,
    select: fn(),
    cancel: fn(),
  },
  parameters: {
    docs: {
      description: {
        component:
          "Set and Change on a runway open this picker: the airport's runways beside the map. Above them, the ATIS source (SayIntentions AI or the newest real ATIS), the provider and time of the ATIS shown, and the METAR wind. Each row reads designator, then chips, then the runway's size, surface and course: an ATIS chip with the information letter on each runway that ATIS puts in use for this end, and a wind chip with the wind along and across the runway, down for headwind and up for tailwind in amber. The Operations flight page opens the same picker and loads the weather itself. LH82 at Frankfurt.",
      },
    },
  },
} satisfies Meta<typeof SelectRunwayModal>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Departure: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "SayIntentions information K departs from 18 and 25C and lands on 25L. The real departure ATIS, information R, departs from the same two.",
      },
    },
  },
  play: async () => {
    const body = within(document.body);

    await expect(await body.findAllByText("ATIS K: in use for departure")).toHaveLength(2);
    await expect(body.getAllByText("ATIS K: in use for arrival")).toHaveLength(1);

    await userEvent.click(
      within(body.getByRole("group", { name: "ATIS source" })).getByRole("button", { name: "Real" }),
    );

    await expect(await body.findAllByText("ATIS R: in use for departure")).toHaveLength(2);
    await expect(body.queryByText(/in use for arrival/)).not.toBeInTheDocument();
  },
};

export const Arrival: Story = {
  args: { kind: "arrival", atisSource: AtisSource.Real, currentSelectionId: null },
  parameters: {
    docs: {
      description: {
        story: "Opened on Real, whose arrival ATIS, information T, lands on 25L and 25R.",
      },
    },
  },
  play: async () => {
    const body = within(document.body);

    await expect(await body.findAllByText("ATIS T: in use for arrival")).toHaveLength(2);
  },
};

export const NoAtis: Story = {
  args: { weather: { status: "ready", reports: [] } },
  parameters: {
    docs: {
      description: {
        story: "No source has an ATIS for the airport, so no runway is marked.",
      },
    },
  },
  play: async () => {
    const body = within(document.body);

    await expect(await body.findByText("None for this airport")).toBeInTheDocument();
    await expect(body.queryByText(/^ATIS .*in use/)).not.toBeInTheDocument();
  },
};
