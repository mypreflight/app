import React, { type ReactNode, type Ref } from "react";
import { LuSparkles } from "react-icons/lu";
import { CHANGELOG_URL } from "~/shared/pwa/UpdateNotice";
import { FieldLabel } from "~/shared/ui/Display/FieldLabel";

type Props = {
  version: string;
  readingsRef?: Ref<HTMLDivElement>;
  children?: ReactNode;
};

export function SidebarStatus({ version, readingsRef, children }: Props) {
  return (
    <div className="mx-2 mt-3 flex flex-col gap-3 border-t border-gray-200 pt-3 dark:border-gray-800">
      <div ref={readingsRef} className="empty:hidden">
        {children}
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5">
          <FieldLabel>Version</FieldLabel>
          <span className="font-mono text-xs tabular-nums text-gray-700 dark:text-gray-300">{version}</span>
        </span>
        <a
          href={CHANGELOG_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="-me-1.5 flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium text-indigo-700 transition-colors duration-150 hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-indigo-300 dark:hover:bg-indigo-500/10"
        >
          <LuSparkles size={13} aria-hidden={true} />
          What’s new
        </a>
      </div>
    </div>
  );
}
