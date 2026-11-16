import React from "react";
import type { TrackingViewState } from "~/features/flight/hooks/useTrackingView";
import { TrackingView } from "~/features/flight/lib/trackingView";
import { ViewSwitch, type ViewSwitchSize } from "~/shared/ui/Tabs/ViewSwitch";

const VIEWS: { view: TrackingView; label: string }[] = [
  { view: TrackingView.Briefing, label: "Briefing" },
  { view: TrackingView.Tracking, label: "Tracking" },
];

type Props = {
  trackingView: TrackingViewState;
  size?: ViewSwitchSize;
  className?: string;
};

export function TrackingViewSwitch({ trackingView, size, className }: Props) {
  return (
    <ViewSwitch
      label="Tracking view"
      activeKey={trackingView.view}
      options={VIEWS.map(({ view, label }) => ({ key: view, label, to: trackingView.pathTo(view) }))}
      size={size}
      className={className}
    />
  );
}
