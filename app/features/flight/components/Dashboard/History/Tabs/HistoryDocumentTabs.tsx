import { TabItem, Tabs } from "flowbite-react";
import React from "react";
import { HistoryTab, needsSimbrief } from "~/features/flight/lib/historyView";

export const HISTORY_TABS: { tab: HistoryTab; title: string }[] = [
  { tab: HistoryTab.Route, title: "Route" },
  { tab: HistoryTab.FuelAndCrew, title: "Fuel & crew" },
  { tab: HistoryTab.Passengers, title: "Passengers" },
  { tab: HistoryTab.Cargo, title: "Cargo" },
  { tab: HistoryTab.OperationalFlightPlan, title: "OFP" },
  { tab: HistoryTab.RunwayAnalysis, title: "Runway analysis" },
  { tab: HistoryTab.Events, title: "Events" },
  { tab: HistoryTab.Delays, title: "Delay report" },
];

type Props = {
  tab: HistoryTab;
  setTab: (tab: HistoryTab) => void;
  isSimbriefAvailable: boolean;
};

export function HistoryDocumentTabs({ tab, setTab, isSimbriefAvailable }: Props) {
  return (
    <Tabs variant="underline" onActiveTabChange={(index) => setTab(HISTORY_TABS[index].tab)}>
      {HISTORY_TABS.map((item) => (
        <TabItem
          key={item.tab}
          active={tab === item.tab}
          title={item.title}
          disabled={needsSimbrief(item.tab) && !isSimbriefAvailable}
        />
      ))}
    </Tabs>
  );
}
