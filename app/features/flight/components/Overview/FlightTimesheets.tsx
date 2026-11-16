import React from "react";
import { ReportPredictedTimesButton } from "~/features/flight/components/Overview/ReportPredictedTimesButton";
import { TimesheetCard } from "~/features/flight/components/Overview/TimesheetCard";
import { useTrackedFlight } from "~/features/flight/hooks/useTrackedFlight";
import { reportableEvents } from "~/features/flight/lib/predictedTimes";

export function FlightTimesheets() {
  const { flight } = useTrackedFlight();

  if (flight === null) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      <TimesheetCard
        title="Scheduled timesheet"
        schedule={flight.timesheet.scheduled}
        emptyMessage="No scheduled timesheet has been filed."
      />
      <TimesheetCard
        title="Estimated timesheet"
        schedule={flight.timesheet.estimated}
        emptyMessage="Waiting for the crew to check in."
      />
      <TimesheetCard
        title="Predicted timesheet"
        schedule={flight.timesheet.predicted}
        emptyMessage="No FMC times reported yet."
        footer={reportableEvents(flight.status).length > 0 && <ReportPredictedTimesButton flight={flight} />}
      />
      <TimesheetCard
        title="Actual timesheet"
        schedule={flight.timesheet.actual}
        emptyMessage="Times will appear here as the flight progresses."
      />
    </div>
  );
}
