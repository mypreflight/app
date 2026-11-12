import React from "react";
import { FlightCargoPanel } from "~/features/cargo-manifest/components/FlightCargoPanel";
import { useHistoryFlight } from "~/features/flight/hooks/useHistoryFlight";

export function HistoryCargoTab() {
  const { flight } = useHistoryFlight();

  if (!flight) return null;

  return <FlightCargoPanel flight={flight} />;
}
