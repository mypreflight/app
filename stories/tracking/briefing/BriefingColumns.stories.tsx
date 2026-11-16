import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { BriefingColumn, BriefingColumns } from "~/features/flight/components/Briefing/BriefingColumns";
import { CardHeader } from "~/shared/ui/Layout/CardHeader";
import { Container } from "~/shared/ui/Layout/Container";
import { atWidth } from "../../support/frames";

function Card({ title, height }: { title: string; height: number }) {
  return (
    <Container padding="condensed" header={<CardHeader title={title} />}>
      <div style={{ height }} className="rounded-lg bg-gray-100 dark:bg-gray-800" />
    </Container>
  );
}

function Columns() {
  return (
    <BriefingColumns>
      <BriefingColumn wide>
        <Card title="Departure airport" height={320} />
        <Card title="Passengers" height={140} />
        <Card title="Crew" height={120} />
      </BriefingColumn>
      <BriefingColumn>
        <Card title="Fuel" height={200} />
        <Card title="Loadsheet" height={160} />
        <Card title="Weather at New York" height={90} />
      </BriefingColumn>
    </BriefingColumns>
  );
}

const meta = {
  title: "Tracking/Briefing/Columns",
  component: Columns,
  parameters: {
    docs: {
      description: {
        component:
          "How a phase page lays out its cards. Each column takes at least 21.5rem and the cards in it at least 20rem; a wide column takes two columns' width, its first card spans it and the cards after it pair up below, so the space under the airport card fills instead of waiting for the tallest card beside it. The same page shows the wide column and one more on a large monitor, the wide column above the rest on a laptop, and one column on a phone. Every card keeps its own height.",
      },
    },
  },
} satisfies Meta<typeof Columns>;

export default meta;

type Story = StoryObj<typeof meta>;

export const LargeMonitor: Story = {
  decorators: [atWidth(1280)],
};

export const Laptop: Story = {
  decorators: [atWidth(900)],
};

export const Phone: Story = {
  decorators: [atWidth(360)],
};
