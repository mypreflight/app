import React, { type ReactNode } from "react";
import { Link } from "react-router";
import { twMerge } from "tailwind-merge";
import { PhaseStateBadge } from "~/features/flight/components/Briefing/PhaseStateBadge";
import type { BriefingPhase, PhaseState } from "~/features/flight/lib/briefingPhase";

export type BriefingPhaseTab = {
  phase: BriefingPhase;
  label: string;
  summary: ReactNode;
  state: PhaseState;
  href: string;
};

type Props = {
  tabs: BriefingPhaseTab[];
  selected: BriefingPhase;
};

export function BriefingPhaseTabs({ tabs, selected }: Props) {
  return (
    <nav
      aria-label="Briefing phases"
      className="grid grid-cols-3 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
    >
      {tabs.map(({ phase, label, summary, state, href }, index) => {
        const isSelected = phase === selected;

        return (
          <Link
            key={phase}
            to={href}
            aria-current={isSelected ? "page" : undefined}
            className={twMerge(
              "flex min-w-0 flex-col items-start gap-1 px-4 py-3 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 max-sm:px-3 max-sm:py-2.5",
              index > 0 && "border-s border-gray-200 dark:border-gray-800",
              isSelected
                ? "bg-white shadow-[inset_0_-2px_0_var(--color-indigo-600)] dark:bg-gray-900 dark:shadow-[inset_0_-2px_0_var(--color-indigo-400)]"
                : "bg-gray-50 hover:bg-indigo-50/60 dark:bg-gray-800/50 dark:hover:bg-indigo-500/10",
            )}
          >
            <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span
                className={twMerge(
                  "text-base font-bold",
                  isSelected ? "text-indigo-700 dark:text-indigo-300" : "text-gray-900 dark:text-white",
                )}
              >
                {label}
              </span>
              <PhaseStateBadge state={state} />
            </span>
            <span className="text-xs text-gray-500 max-sm:hidden dark:text-gray-400">{summary}</span>
          </Link>
        );
      })}
    </nav>
  );
}
