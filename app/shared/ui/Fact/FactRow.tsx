import React from "react";
import { twMerge } from "tailwind-merge";

type Props = {
  label: string;
  className?: string;
  children: React.ReactNode;
};

export function FactRow({ label, className, children }: Props) {
  return (
    <div className={twMerge("flex gap-3 px-3 py-1.5", className)}>
      <dt className="w-20 shrink-0 pt-0.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {label}
      </dt>
      <dd className="min-w-0 flex-1 text-sm text-gray-800 dark:text-gray-200">{children}</dd>
    </div>
  );
}
