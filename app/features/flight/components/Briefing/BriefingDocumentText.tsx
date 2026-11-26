import React, { type ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function BriefingDocumentText({ children }: Props) {
  return (
    <div className="@container">
      <div className="overflow-x-auto overflow-y-hidden font-mono text-[length:max(11px,100cqi/41.5)] leading-[1.1] text-gray-700 dark:text-gray-300 [&_div]:text-[length:inherit]! [&_div]:leading-[inherit]!">
        {children}
      </div>
    </div>
  );
}
