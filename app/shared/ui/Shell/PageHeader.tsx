import React, { type ReactNode } from "react";
import { ShellSlot, ShellSlotPortal } from "~/app-state/useShellSlots";
import { SHELL_BARS_QUERY, useMediaQuery } from "~/shared/hooks/useMediaQuery";
import { Breadcrumbs, type Crumb } from "~/shared/ui/Section/Breadcrumbs";

type Props = ({ title: string; crumbs?: never } | { crumbs: Crumb[]; title?: never }) & {
  actions?: ReactNode;
};

export function PageHeader({ title, crumbs, actions }: Props) {
  const hasShellBars = useMediaQuery(SHELL_BARS_QUERY);

  if (hasShellBars) {
    return (
      <ShellSlotPortal slot={ShellSlot.TopBar}>
        <div className="flex min-w-0 flex-1 items-center">
          {crumbs ? (
            <Breadcrumbs items={crumbs} />
          ) : (
            <h1 className="truncate text-sm font-semibold text-gray-900 dark:text-white">{title}</h1>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </ShellSlotPortal>
    );
  }

  if (crumbs) {
    return (
      <div className="mb-5 mt-2 flex items-center justify-between gap-4">
        <Breadcrumbs items={crumbs} />
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    );
  }

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{title}</h1>
      {actions && <div className="flex flex-row flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
