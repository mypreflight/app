import { TableRow } from "flowbite-react";
import React, { Children, cloneElement, isValidElement, type ReactNode } from "react";
import { Link } from "react-router";
import { twMerge } from "tailwind-merge";

type Props = {
  to: string;
  className?: string;
  children: ReactNode;
};

type CellProps = {
  className?: string;
  children?: ReactNode;
};

export function LinkedTableRow({ to, className, children }: Props) {
  return (
    <TableRow
      className={twMerge(
        "bg-white transition-colors hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800/60",
        className,
      )}
    >
      {Children.map(children, (cell) =>
        isValidElement<CellProps>(cell)
          ? cloneElement(cell, {
              className: twMerge("relative", cell.props.className),
              children: (
                <>
                  <Link to={to} viewTransition tabIndex={-1} aria-hidden={true} className="absolute inset-0" />
                  {cell.props.children}
                </>
              ),
            })
          : cell,
      )}
    </TableRow>
  );
}
