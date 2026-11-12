import React from "react";
import { HiChevronRight } from "react-icons/hi";
import { Link } from "react-router";
import { twMerge } from "tailwind-merge";
import type { RecordListLayout } from "~/shared/ui/List/recordListLayout";

type Props = {
  layout: RecordListLayout;
  href: string;
  label: string;
  trailing: React.ReactNode;
  children: React.ReactNode;
  previewed?: boolean;
  onPreview?: () => void;
};

export function RecordListRow({ layout, href, label, trailing, children, previewed = false, onPreview }: Props) {
  return (
    <li className="border-b border-gray-200 last:border-b-0 dark:border-gray-800">
      <div
        onPointerEnter={onPreview}
        className={twMerge(
          `${layout.grid} relative items-center bg-white transition-colors hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800/60`,
          previewed && "lg:bg-indigo-50 lg:hover:bg-indigo-50 lg:dark:bg-indigo-500/10 lg:dark:hover:bg-indigo-500/10",
        )}
      >
        <Link
          to={href}
          viewTransition
          aria-label={label}
          onFocus={onPreview}
          className="absolute inset-0 z-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 dark:focus-visible:ring-indigo-400"
        />
        {children}
        <HiChevronRight
          className={`${layout.chevronClassName} size-4 shrink-0 text-gray-500 dark:text-gray-400`}
          aria-hidden
        />
        <span className={layout.trailingClassName}>{trailing}</span>
      </div>
    </li>
  );
}
