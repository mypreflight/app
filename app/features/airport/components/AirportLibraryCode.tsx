import React from "react";
import { Link } from "react-router";

type Props = {
  icaoCode: string;
  href: string;
};

export function AirportLibraryCode({ icaoCode, href }: Props) {
  return (
    <Link
      to={href}
      className="rounded-sm font-mono text-xs font-bold text-indigo-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-indigo-400"
    >
      {icaoCode}
    </Link>
  );
}
