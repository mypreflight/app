import { TableRow } from "flowbite-react";
import React, { type MouseEvent, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { twMerge } from "tailwind-merge";

type Props = {
  to: string;
  className?: string;
  children: ReactNode;
};

const INTERACTIVE = "a, button, input, select, textarea, label";

export function LinkedTableRow({ to, className, children }: Props) {
  const navigate = useNavigate();

  function open(event: MouseEvent<HTMLTableRowElement>) {
    if ((event.target as HTMLElement).closest(INTERACTIVE) !== null) {
      return;
    }

    if (window.getSelection()?.isCollapsed === false) {
      return;
    }

    if (event.metaKey || event.ctrlKey) {
      window.open(to, "_blank", "noopener");
      return;
    }

    navigate(to, { viewTransition: true });
  }

  return (
    <TableRow
      onClick={open}
      className={twMerge(
        "cursor-pointer bg-white transition-colors hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800/60",
        className,
      )}
    >
      {children}
    </TableRow>
  );
}
