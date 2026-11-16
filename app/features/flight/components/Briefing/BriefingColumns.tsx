import React, { type ReactNode } from "react";

export function BriefingColumns({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-start gap-3">{children}</div>;
}

export function BriefingColumn({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-[1_1_21.5rem] flex-wrap items-start gap-3 *:min-w-0 *:flex-[1_1_20rem]">
      {children}
    </div>
  );
}
