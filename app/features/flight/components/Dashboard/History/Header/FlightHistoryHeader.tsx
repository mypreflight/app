import React from "react";
import { LuHistory } from "react-icons/lu";
import type { Diversion } from "~/features/diversion";
import type { Flight } from "~/features/flight";
import { ArrivalPunctualityBadge } from "~/features/flight/components/Dashboard/History/Header/ArrivalPunctualityBadge";
import { DiversionBanner } from "~/features/flight/components/Dashboard/Tracking/Header/DiversionBanner";
import { TrackingRoute } from "~/features/flight/components/Dashboard/Tracking/Header/TrackingRoute";
import { FlightStatusBadge } from "~/features/flight/components/Flight/FlightStatusBadge";
import { FlightIdentity } from "~/features/flight/components/FlightIdentity";
import { FormattedIcaoDate } from "~/shared/ui/Date/FormattedIcaoDate";
import { Container } from "~/shared/ui/Layout/Container";
import { Breadcrumbs } from "~/shared/ui/Section/Breadcrumbs";
import { ViewSwitch, type ViewSwitchOption } from "~/shared/ui/Tabs/ViewSwitch";

type Props = {
  flight: Flight;
  diversion: Diversion | null;
  views: ViewSwitchOption[];
  activeView: string;
};

export function FlightHistoryHeader({ flight, diversion, views, activeView }: Props) {
  const { airframe } = flight.aircraft;
  const flownOn = flight.timesheet.actual?.offBlockTime ?? flight.timesheet.scheduled.offBlockTime;

  return (
    <Container padding="spacious" className="@container">
      <h1 className="sr-only">Flight {flight.flightNumber}</h1>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-gray-200 pb-3 dark:border-gray-800">
        <Breadcrumbs
          items={[
            { label: "Flight history", to: "/flight-history" },
            { label: flight.flightNumber, mono: true },
          ]}
        />
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
          <span className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
            <LuHistory aria-hidden={true} className="size-4 shrink-0 text-gray-500 dark:text-gray-400" />
            Flown
            <span className="font-bold text-gray-900 dark:text-white">
              <FormattedIcaoDate date={flownOn} />
            </span>
          </span>
          <FlightStatusBadge status={flight.status} serviceType={flight.serviceType} />
          <ArrivalPunctualityBadge timesheet={flight.timesheet} className="@2xl:hidden" />
        </div>
      </div>
      <div className="grid grid-cols-1 items-center gap-x-6 gap-y-4 [grid-template-areas:'identity'_'route'_'view'] @2xl:grid-cols-[auto_minmax(0,1fr)] @2xl:[grid-template-areas:'identity_route'_'view_status'] @4xl:grid-cols-[minmax(0,max-content)_minmax(min-content,18rem)_minmax(0,1fr)_auto_auto] @4xl:[grid-template-areas:'identity_route_._view_status']">
        <div className="min-w-0 [grid-area:identity]">
          <FlightIdentity
            operator={flight.operator}
            flightNumber={flight.flightNumber}
            aircraftId={flight.aircraft.id}
            registration={flight.aircraft.registration}
            detail={
              <span title={airframe.name}>
                <span aria-hidden={true}> · </span>
                <span className="italic">{airframe.name}</span>
              </span>
            }
          />
        </div>
        <TrackingRoute
          flight={flight}
          diverted={diversion !== null}
          showsBlockTime={false}
          className="[grid-area:route]"
        />
        <ViewSwitch
          label="Flight history view"
          options={views}
          activeKey={activeView}
          className="[grid-area:view] @2xl:w-fit"
        />
        <ArrivalPunctualityBadge
          timesheet={flight.timesheet}
          className="hidden w-fit [grid-area:status] @2xl:inline-flex @2xl:justify-self-end"
        />
      </div>
      {diversion && <DiversionBanner diversion={diversion} label="Diverted to" />}
    </Container>
  );
}
