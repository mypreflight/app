import React, { type ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export function BriefingColumns({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-start gap-3">{children}</div>;
}

type BriefingColumnProps = {
  wide?: boolean;
  children: ReactNode;
};

export function BriefingColumn({ wide = false, children }: BriefingColumnProps) {
  return (
    <div
      className={twMerge(
        "flex min-w-0 flex-[1_1_21.5rem] flex-wrap items-start gap-3 *:min-w-0 *:flex-[1_1_20rem]",
        wide && "flex-[2_1_43.75rem] *:first:flex-[1_1_100%]",
      )}
    >
      {children}
    </div>
  );
}
