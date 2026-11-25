import React from "react";
import { twMerge } from "tailwind-merge";
import { toHuman } from "~/i18n/translate";

type Props = {
  carriesDangerousGoods: boolean;
};

export function NotocStatement({ carriesDangerousGoods }: Props) {
  return (
    <p
      className={twMerge(
        "rounded-xl border px-4 py-3 text-base font-bold",
        carriesDangerousGoods
          ? "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200"
          : "border-gray-200 bg-gray-50 text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100",
      )}
    >
      {toHuman.notoc.statement(carriesDangerousGoods)}
    </p>
  );
}
