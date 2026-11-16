import React, { type ReactNode } from "react";

type Props = {
  title: string;
  summary: ReactNode;
  children?: ReactNode;
};

export function BriefingPhaseHeader({ title, summary, children }: Props) {
  return (
    <div className="mt-1 flex flex-wrap items-end justify-between gap-x-4 gap-y-2.5">
      <div className="min-w-0">
        <h2 className="text-balance text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{summary}</p>
      </div>
      {children}
    </div>
  );
}
