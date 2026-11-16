import type { Meta, StoryObj } from "@storybook/react-vite";
import { AirportWeatherCard } from "~/features/airport/components/AirportWeatherCard";
import { frankfurtWeather } from "../../fixtures/briefing";
import { atWidth } from "../../support/frames";

const meta = {
  title: "Tracking/Briefing/Airport weather card",
  component: AirportWeatherCard,
  decorators: [atWidth(380)],
  args: {
    city: "Frankfurt",
    icaoCode: "EDDF",
    libraryHref: "/airports-library/eddf",
    weather: { status: "ready", reports: frankfurtWeather },
  },
  parameters: {
    docs: {
      description: {
        component:
          "An airport's weather in a briefing column, built from the same reports as the airport card: METAR and TAF from the source the switch picks, each TAF change group on its own line, then the SayIntentions ATIS. The ICAO code links to the airport in the library. Seeded Frankfurt reports.",
      },
    },
  },
} satisfies Meta<typeof AirportWeatherCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Reported: Story = {};

export const Loading: Story = {
  args: { weather: { status: "loading" } },
};

export const NoReport: Story = {
  args: { city: "New York", icaoCode: "KJFK", weather: { status: "ready", reports: [] } },
};

export const LoadFailed: Story = {
  args: { weather: { status: "failed" } },
};

export const WideColumn: Story = {
  decorators: [atWidth(900)],
};
