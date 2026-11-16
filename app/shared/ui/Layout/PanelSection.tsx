import React, { type ReactNode } from "react";
import { twMerge } from "tailwind-merge";

type Props = {
  title: string;
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function PanelSection({ title, aside, className, children }: Props) {
  return (
    <section className={twMerge("flex min-w-0 flex-col gap-1.5", className)}>
      <header className="flex min-h-8 flex-wrap items-center justify-between gap-x-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{title}</h3>
        {aside !== undefined && aside !== null && (
          <div className="flex shrink-0 items-center gap-2 text-xs text-gray-500 dark:text-gray-400">{aside}</div>
        )}
      </header>
      {children}
    </section>
  );
}
