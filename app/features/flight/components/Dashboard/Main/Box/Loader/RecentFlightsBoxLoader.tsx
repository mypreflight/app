import React from "react";
import { CardHeader } from "~/shared/ui/Layout/CardHeader";
import { Container } from "~/shared/ui/Layout/Container";

const ROWS = ["first", "second", "third"];

export function RecentFlightsBoxLoader() {
  return (
    <Container
      padding="none"
      className="animate-pulse motion-reduce:animate-none"
      header={<CardHeader title="Recent flights" />}
    >
      <div className="flex flex-col py-1">
        {ROWS.map((row) => (
          <div key={row} className="flex items-center gap-3 px-3 py-2.5">
            <div className="size-7 rounded-md bg-gray-200 dark:bg-gray-700" />
            <div className="h-3.5 w-14 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="ms-auto h-3.5 w-20 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-3 w-10 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        ))}
      </div>
    </Container>
  );
}
