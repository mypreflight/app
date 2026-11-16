import React from "react";
import { HiChevronRight } from "react-icons/hi";
import { LuHistory } from "react-icons/lu";
import { Link } from "react-router";
import type { Flight } from "~/features/flight";
import { FlightTopBarIdentity } from "~/features/flight/components/Dashboard/Tracking/Header/FlightTopBar";
import { FlightStatusBadge } from "~/features/flight/components/Flight/FlightStatusBadge";
import { FormattedIcaoDate } from "~/shared/ui/Date/FormattedIcaoDate";
import { ViewSwitch, type ViewSwitchOption } from "~/shared/ui/Tabs/ViewSwitch";

type Props = {
  flight: Flight;
  diverted: boolean;
  views: ViewSwitchOption[];
  activeView: string;
};

export function FlightHistoryTopBar({ flight, diverted, views, activeView }: Props) {
  const flownOn = flight.timesheet.actual?.offBlockTime ?? flight.timesheet.scheduled.offBlockTime;

  return (
    <>
      <div className="@container flex min-w-0 flex-1 flex-wrap items-center gap-x-3.5 gap-y-1">
        <nav aria-label="Breadcrumb">
          <Link
            to="/flight-history"
            viewTransition
            className="flex items-center gap-1 whitespace-nowrap text-[0.8125rem] text-gray-600 transition-colors hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
          >
            Flight history
            <HiChevronRight aria-hidden={true} className="size-4 shrink-0 text-gray-500 dark:text-gray-400" />
          </Link>
        </nav>
        <FlightTopBarIdentity
          flight={flight}
          diverted={diverted}
          showsBlockTime={false}
          citiesClassName="@max-[41rem]:hidden"
        />
      </div>
      <div className="flex shrink-0 items-center gap-2.5">
        <span className="flex items-center gap-1.5 whitespace-nowrap text-[0.8125rem] text-gray-600 dark:text-gray-300">
          <LuHistory aria-hidden={true} className="size-4 shrink-0 text-gray-500 dark:text-gray-400" />
          Flown
          <span className="font-bold text-gray-900 dark:text-white">
            <FormattedIcaoDate date={flownOn} />
          </span>
        </span>
        <FlightStatusBadge status={flight.status} serviceType={flight.serviceType} />
      </div>
      <ViewSwitch label="Flight history view" options={views} activeKey={activeView} size="sm" className="shrink-0" />
    </>
  );
}
