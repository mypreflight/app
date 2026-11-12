import React from "react";
import type { TrackingViewState } from "~/features/flight/hooks/useTrackingView";
import { TrackingView } from "~/features/flight/lib/trackingView";
import { ViewSwitch } from "~/shared/ui/Tabs/ViewSwitch";

const VIEWS: { view: TrackingView; label: string }[] = [
  { view: TrackingView.Briefing, label: "Briefing" },
  { view: TrackingView.Tracking, label: "Tracking" },
];

type Props = {
  trackingView: TrackingViewState;
  className?: string;
};

export function TrackingViewSwitch({ trackingView, className }: Props) {
  return (
    <ViewSwitch
      label="Tracking view"
      activeKey={trackingView.view}
      options={VIEWS.map(({ view, label }) => ({ key: view, label, to: trackingView.pathTo(view) }))}
      className={className}
    />
  );
}
