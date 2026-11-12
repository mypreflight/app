import React, { useLayoutEffect, useState } from "react";
import { Outlet, useParams } from "react-router";
import { FlightHistoryPanel } from "~/features/flight/components/List/History/FlightHistoryPanel";
import { FlightHistoryStage } from "~/features/flight/components/List/History/FlightHistoryStage";
import { FlightHistoryStageProvider, useFlightHistoryStage } from "~/features/flight/hooks/useFlightHistoryStage";

function FlightHistoryFrame({ flightId, view }: { flightId: string | undefined; view: string | undefined }) {
  const { handoff, selectedId } = useFlightHistoryStage();
  const isList = flightId === undefined;
  const isHandingOff = handoff !== null && handoff.flightId === flightId && view === undefined;
  const [isStageMounted, setIsStageMounted] = useState(isList);

  if (isList && !isStageMounted) {
    setIsStageMounted(true);
  }

  useLayoutEffect(() => {
    if (flightId !== undefined) document.querySelector("main")?.scrollTo({ top: 0 });
  }, [flightId]);

  return (
    <>
      {isStageMounted && <FlightHistoryStage parked={!isList && !isHandingOff} />}
      {isStageMounted && <FlightHistoryPanel leaving={!isList || selectedId !== null} parked={!isList} />}
      <Outlet />
    </>
  );
}

export default function FlightHistoryLayout() {
  const { id, view } = useParams();

  return (
    <FlightHistoryStageProvider flightId={id}>
      <FlightHistoryFrame flightId={id} view={view} />
    </FlightHistoryStageProvider>
  );
}
