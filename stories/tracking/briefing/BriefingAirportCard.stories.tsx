import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { expect, userEvent, within } from "storybook/test";
import { type AirportWeatherReport, WeatherInformationType, WeatherSource } from "~/features/airport";
import { type Diversion, DiversionReason, DiversionSeverity } from "~/features/diversion";
import { type Flight, FlightStatus } from "~/features/flight";
import { BriefingAirportCard } from "~/features/flight/components/Briefing/Airport/BriefingAirportCard";
import { TrackedFlightContext } from "~/features/flight/hooks/useTrackedFlight";
import {
  BridgeAvailability,
  DeicingCapability,
  FuelingOption,
  GateLocation,
  GroundUnitAvailability,
  NoiseSensitivity,
  ParkingAssistance,
  type ParkingPosition,
  ParkingPositionType,
  ParkingSpotType,
  StairsBoarding,
} from "~/features/parking-position";
import { LightingType, type Runway, SurfaceType } from "~/features/runway";
import type { Terminal } from "~/features/terminal";
import { frankfurtRunways, frankfurtWeather, natFlight, natTrackedFlight } from "../../fixtures/briefing";
import assignments from "../../fixtures/frankfurt-departure-assignments.json";
import newYorkLayout from "../../fixtures/new-york-layout.json";
import { type ServiceStubs, withApi } from "../../support/api";
import { atWidth } from "../../support/frames";

const FRANKFURT_ID = natFlight().departureAirport.id;
const NEW_YORK_ID = natFlight().destinationAirport.id;
const MINUTE = 60_000;

const newYorkRunway: Runway = {
  id: "8d3b6f21-5c4e-4a7d-9e10-2b7c4f6a1d93",
  airportId: NEW_YORK_ID,
  designator: "31R",
  length: 3048,
  width: 61,
  displace: 290,
  trueHeading: 316,
  magneticHeading: 329,
  elevation: 4,
  surfaceType: SurfaceType.Asphalt,
  lightingType: LightingType.HIRL,
  coordinates: { latitude: 40.6302, longitude: -73.7712 },
};

const newYorkTerminal: Terminal = {
  id: "5e2a7c90-1b3d-4f86-a4c2-9d0e8b7f6a15",
  airportId: NEW_YORK_ID,
  shortName: "T1",
  fullName: "Terminal 1",
  averageTaxiTime: 16,
  operatorCodes: ["DLH", "AFR"],
  text: null,
  shape: null,
};

const newYorkStand: ParkingPosition = {
  id: "a91c3e57-7d24-4b6f-8e0a-3c5f1b9d2e48",
  airportId: NEW_YORK_ID,
  terminalId: newYorkTerminal.id,
  name: "4",
  bridge: BridgeAvailability.Yes,
  stairs: StairsBoarding.No,
  deicing: DeicingCapability.No,
  deicingDescription: null,
  gpu: GroundUnitAvailability.Bridge,
  pca: GroundUnitAvailability.No,
  type: ParkingPositionType.StraightIn,
  spotType: ParkingSpotType.Passenger,
  assistance: ParkingAssistance.Marshaller,
  location: GateLocation.Gate,
  noiseSensitivity: NoiseSensitivity.Yes,
  noiseSensitivityText: "Engines at idle only after pushback.",
  noiseSensitivityStartTime: "03:00",
  noiseSensitivityEndTime: "10:00",
  fuelingOptions: FuelingOption.Hydrant,
  coordinates: { latitude: 40.643, longitude: -73.7894 },
};

const newYorkWeather: AirportWeatherReport[] = [
  {
    id: "2f8d1a63-9b4e-4c70-8a15-6e3b7d0c9f24",
    source: WeatherSource.AviationWeatherGov,
    informationType: WeatherInformationType.Metar,
    content: "KJFK 081751Z 31012KT 10SM FEW050 SCT250 27/14 A3002",
    lastFetched: "2026-07-08T18:00:00.000Z",
    publishedAt: null,
    arrivalRunways: [],
    departureRunways: [],
  },
  {
    id: "7c0e4b92-3a6d-4f18-b5c7-1e9a2d8f6b30",
    source: WeatherSource.AviationWeatherGov,
    informationType: WeatherInformationType.Taf,
    content: "KJFK 081720Z 0818/0924 31012KT P6SM FEW050 FM090200 34008KT P6SM SCT250 FM091400 18010KT P6SM FEW040",
    lastFetched: "2026-07-08T18:00:00.000Z",
    publishedAt: null,
    arrivalRunways: [],
    departureRunways: [],
  },
  {
    id: "4d7a1e95-2c3b-4f80-9e6d-8b1f0a5c7e32",
    source: WeatherSource.FaaDatis,
    informationType: WeatherInformationType.Atis,
    content:
      "JFK ATIS INFO H 1751Z. 31012KT 10SM FEW050 SCT250 27/14 A3002 (THREE ZERO ZERO TWO). ILS RWY 31R APCH IN USE. DEPG RWY 31L. ...ADVS YOU HAVE INFO H.",
    lastFetched: "2026-07-08T18:00:00.000Z",
    publishedAt: "2026-07-08T17:51:00.000Z",
    arrivalRunways: ["8d3b6f21-5c4e-4a7d-9e10-2b7c4f6a1d93"],
    departureRunways: ["12881dbb-929e-466c-86a7-3639d8472269"],
  },
];

const pending = () => new Promise<never>(() => {});
const failing = () => Promise.reject(new Error("Service unavailable"));

const servedApi: ServiceStubs = {
  airportService: {
    fetchWeather: async (airportId: string) => (airportId === FRANKFURT_ID ? frankfurtWeather : newYorkWeather),
  },
  runwayService: {
    fetchById: async (airportId: string) => (airportId === FRANKFURT_ID ? assignments.runway : newYorkRunway) as never,
    fetchAll: async (airportId: string) =>
      (airportId === FRANKFURT_ID ? frankfurtRunways : newYorkLayout.runways) as never,
  },
  parkingPositionService: {
    fetchById: async (airportId: string) =>
      (airportId === FRANKFURT_ID ? assignments.parkingPosition : newYorkStand) as never,
  },
  terminalService: {
    fetchAll: async (airportId: string) =>
      (airportId === FRANKFURT_ID ? assignments.terminals : [newYorkTerminal]) as never,
  },
};

type FlightOptions = {
  status: FlightStatus;
  departureAssigned?: boolean;
  arrivalAssigned?: boolean;
  diverted?: boolean;
};

function cardFlight({ status, departureAssigned = true, arrivalAssigned = false }: FlightOptions): Flight {
  const flight = natFlight(status);

  if (!departureAssigned) {
    flight.departureRunwayId = null;
    flight.departureParkingPositionId = null;
  }

  if (arrivalAssigned) {
    flight.arrivalRunwayId = newYorkRunway.id;
    flight.arrivalParkingPositionId = newYorkStand.id;
  }

  return flight;
}

function diversionFrom(flight: Flight): Diversion {
  return {
    id: "d6b2e9f0-4a17-4c3b-8e52-0f9a1c7d3b64",
    severity: DiversionSeverity.Caution,
    reason: DiversionReason.Medical,
    freeText: "",
    position: { latitude: 47.1, longitude: -52.9 },
    notifySecurityOnGround: false,
    notifyMedicalOnGround: true,
    notifyFirefightersOnGround: false,
    airport: {
      ...flight.destinationAirport,
      id: "b07e3d5a-62c1-4f9e-a8d4-5c1b0e7f2a96",
      icaoCode: "CYQX",
      iataCode: "YQX",
      name: "Gander Intl",
      city: { ...flight.destinationAirport.city, name: "Gander" },
      country: { code: "CA", name: "Canada" },
    },
    decisionTime: new Date(Date.now() - 20 * MINUTE),
    estimatedTimeAtDestination: new Date(Date.now() + 75 * MINUTE),
  } as Diversion;
}

function onFlight(options: FlightOptions): Decorator {
  return (Story) => {
    const flight = cardFlight(options);
    const tracked = { ...natTrackedFlight(flight), diversion: options.diverted ? diversionFrom(flight) : null };

    return (
      <TrackedFlightContext.Provider value={tracked}>
        <Story />
      </TrackedFlightContext.Provider>
    );
  };
}

const meta = {
  title: "Tracking/Briefing/Airport card",
  component: BriefingAirportCard,
  decorators: [withApi(servedApi), atWidth(820)],
  args: { end: "departure" },
  parameters: {
    docs: {
      description: {
        component:
          "One end of the flight in the briefing, two briefing columns wide: the airport, then its weather (METAR and TAF from the chosen source, with each TAF change group on its own line, and the ATIS for that end, SayIntentions AI or the newest real one, switchable when both exist) beside its terminal, parking stand and runway. Beside the assigned runway, an ATIS chip with the information letter says whether that ATIS uses it (green ARR, DEP or both) or names the runways it uses instead (amber), and a wind chip gives the METAR wind along and across it: down for headwind, up for tailwind in amber, the side arrow for the crosswind. Departure lists them from the stand out to the runway, arrival from the runway in to the stand. Set and Change open the existing pickers while the flight's status still allows it. The columns stack when the card is narrower than 42rem. LH82, Frankfurt to New York.",
      },
    },
  },
} satisfies Meta<typeof BriefingAirportCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Departure: Story = {
  decorators: [onFlight({ status: FlightStatus.Ready })],
  parameters: {
    docs: {
      description: {
        story:
          "Before check-in, with the stand and runway assigned: both can still be changed. ATIS K departs from 18 and 25C, and the wind blows down 07C from behind, so both chips are amber.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText("B42")).toBeInTheDocument();
    await expect(canvas.getByText("PROB30 TEMPO 0818/0822 4000 TSRA BKN030CB")).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "Change parking stand" })).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "Change runway" })).toBeInTheDocument();
    await expect(await canvas.findByText("ATIS K: departure from 18, 25C, not this runway")).toBeInTheDocument();
    await expect(canvas.getByText("Wind: tailwind 8 knots, crosswind 1 from the right")).toBeInTheDocument();
  },
};

export const DepartureRealAtis: Story = {
  decorators: [onFlight({ status: FlightStatus.Ready })],
  parameters: {
    docs: {
      description: {
        story:
          "An aircraft requested Frankfurt's real departure ATIS over datalink. Switching to Real shows it, with its letter on the runway's chip.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const switcher = await canvas.findByRole("group", { name: "ATIS source" });

    await userEvent.click(within(switcher).getByRole("button", { name: "Real" }));

    await expect(await canvas.findByText("Departure ATIS")).toBeInTheDocument();
    await expect(canvas.getByText("ATIS R: departure from 18, 25C, not this runway")).toBeInTheDocument();
  },
};

export const DepartureNothingAssigned: Story = {
  decorators: [onFlight({ status: FlightStatus.Ready, departureAssigned: false })],
  parameters: {
    docs: {
      description: {
        story: "Operations has not assigned a stand or runway yet; the dashed slots wait for them.",
      },
    },
  },
};

export const DepartureNothingAssignedAfterOffBlock: Story = {
  decorators: [onFlight({ status: FlightStatus.TaxiingOut, departureAssigned: false })],
  parameters: {
    docs: {
      description: {
        story:
          "Taxiing out without a stand or runway: neither can be set any more, and each empty slot says since when.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText("Cannot assign after off-block")).toBeInTheDocument();
    await expect(canvas.getByText("Cannot assign after check-in")).toBeInTheDocument();
    await expect(canvas.queryByRole("button", { name: /^Set / })).not.toBeInTheDocument();
  },
};

export const DepartureAfterBoarding: Story = {
  decorators: [onFlight({ status: FlightStatus.BoardingStarted })],
  parameters: {
    docs: {
      description: {
        story: "Once boarding starts the stand is fixed; only the runway can still change.",
      },
    },
  },
};

export const Loading: Story = {
  decorators: [
    onFlight({ status: FlightStatus.Ready }),
    withApi({
      airportService: { fetchWeather: pending },
      runwayService: { fetchById: pending },
      parkingPositionService: { fetchById: pending },
    }),
  ],
  parameters: {
    docs: { description: { story: "While the weather, stand and runway are on their way." } },
  },
};

export const LoadFailed: Story = {
  decorators: [
    onFlight({ status: FlightStatus.Ready }),
    withApi({
      airportService: { fetchWeather: failing },
      runwayService: { fetchById: failing },
      parkingPositionService: { fetchById: failing },
    }),
  ],
  parameters: {
    docs: { description: { story: "The API did not answer; each column says so and how to recover." } },
  },
};

export const Phone: Story = {
  decorators: [onFlight({ status: FlightStatus.Ready }), atWidth(360)],
  parameters: {
    docs: { description: { story: "On a phone the ground column follows the weather." } },
  },
};

export const Arrival: Story = {
  args: { end: "arrival" },
  decorators: [onFlight({ status: FlightStatus.InCruise, arrivalAssigned: true })],
  parameters: {
    docs: {
      description: {
        story:
          "In cruise, with a noise-sensitive stand: the runway and stand can still change. The FAA D-ATIS is the only ATIS here: information H lands on the assigned runway, into a 12 kt headwind.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText("ATIS H: in use for arrival")).toBeInTheDocument();
    await expect(canvas.getByText("Wind: headwind 12 knots, crosswind 1 from the left")).toBeInTheDocument();
  },
};

export const ArrivalDiverting: Story = {
  args: { end: "arrival" },
  decorators: [onFlight({ status: FlightStatus.InCruise, arrivalAssigned: true, diverted: true })],
  parameters: {
    docs: {
      description: {
        story: "After a diversion the planned destination is struck through and can no longer be changed.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText("Diverting to")).toBeInTheDocument();
    await expect(canvas.queryByRole("button", { name: /runway/ })).not.toBeInTheDocument();
  },
};
