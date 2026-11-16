import React from "react";
import { Link } from "react-router";
import { twMerge } from "tailwind-merge";

export type ViewSwitchOption = {
  key: string;
  label: string;
  to: string;
};

export type ViewSwitchSize = "md" | "sm";

type Props = {
  label: string;
  options: ViewSwitchOption[];
  activeKey: string;
  size?: ViewSwitchSize;
  className?: string;
};

const OPTION_SIZES: Record<ViewSwitchSize, string> = {
  md: "h-9 px-4 text-sm",
  sm: "h-7 px-2.5 text-xs",
};

export function ViewSwitch({ label, options, activeKey, size = "md", className }: Props) {
  const activeIndex = options.findIndex(({ key }) => key === activeKey);

  return (
    <nav
      aria-label={label}
      className={twMerge(
        "relative grid min-w-0 auto-cols-fr grid-flow-col overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900",
        className,
      )}
    >
      <span
        aria-hidden={true}
        className="absolute inset-y-0 left-0 bg-indigo-50 transition-transform duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none dark:bg-indigo-500/15"
        style={{ width: `${100 / options.length}%`, transform: `translateX(${activeIndex * 100}%)` }}
      />
      {options.map(({ key, label: optionLabel, to }, index) => {
        const active = index === activeIndex;

        return (
          <Link
            key={key}
            to={to}
            viewTransition
            aria-current={active ? "page" : undefined}
            className={twMerge(
              OPTION_SIZES[size],
              "relative flex items-center justify-center font-semibold transition-colors duration-250 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 pointer-coarse:h-11 dark:focus-visible:ring-indigo-400",
              index > 0 && "border-s border-gray-200 dark:border-gray-700",
              active
                ? "text-indigo-700 dark:text-indigo-300"
                : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white",
            )}
          >
            {optionLabel}
          </Link>
        );
      })}
    </nav>
  );
}
