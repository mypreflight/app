import React from "react";
import type { IconType } from "react-icons";
import { twMerge } from "tailwind-merge";

type Props = {
  icon: IconType;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  tone?: "neutral" | "accent";
  className?: string;
};

const TILE_TONES = {
  neutral: "bg-gray-50 text-gray-500 ring-gray-200 dark:bg-gray-800/60 dark:text-gray-400 dark:ring-gray-700",
  accent:
    "bg-indigo-50 text-indigo-600 ring-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:ring-indigo-800/60",
};

export function EmptyState({ icon: Icon, title, description, action, tone = "neutral", className }: Props) {
  return (
    <div className={twMerge("my-auto flex flex-col items-center px-4 py-5 text-center", className)}>
      <span
        className={twMerge("flex size-10 items-center justify-center rounded-lg ring-1 ring-inset", TILE_TONES[tone])}
      >
        <Icon className="size-5" strokeWidth={1.75} aria-hidden={true} />
      </span>
      <p className="mt-3 text-sm font-semibold text-gray-900 dark:text-white">{title}</p>
      {description && (
        <p className="mt-1 max-w-64 text-balance text-sm text-gray-500 dark:text-gray-400">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
