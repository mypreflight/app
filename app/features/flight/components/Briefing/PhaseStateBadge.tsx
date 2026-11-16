import React from "react";
import { LuCheck } from "react-icons/lu";
import { twMerge } from "tailwind-merge";
import type { PhaseState } from "~/features/flight/lib/briefingPhase";

const BADGE = "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-2xs font-bold uppercase tracking-wider";

export function PhaseStateBadge({ state }: { state: PhaseState }) {
  if (state === "done") {
    return (
      <span className={twMerge(BADGE, "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300")}>
        <LuCheck className="size-3" aria-hidden={true} />
        Done
      </span>
    );
  }

  if (state === "now") {
    return (
      <span className={twMerge(BADGE, "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300")}>
        Now
      </span>
    );
  }

  return null;
}
