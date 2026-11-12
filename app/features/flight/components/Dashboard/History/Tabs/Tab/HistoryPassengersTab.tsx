import React from "react";
import { FlightManifestPanel } from "~/features/flight/components/Cabin/FlightManifestPanel";
import { useHistoryFlight } from "~/features/flight/hooks/useHistoryFlight";

export function HistoryPassengersTab() {
  const { flight, loadsheets } = useHistoryFlight();

  if (!flight) return null;

  return <FlightManifestPanel flight={flight} loadsheets={loadsheets} />;
}
