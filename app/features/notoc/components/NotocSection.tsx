import React, { useId, useState } from "react";
import { LuChevronDown } from "react-icons/lu";
import { twMerge } from "tailwind-merge";

type Props = {
  title: string;
  count: number;
  summary: React.ReactNode;
  children: React.ReactNode;
};

export function NotocSection({ title, count, summary, children }: Props) {
  const [open, setOpen] = useState(true);
  const contentId = useId();

  return (
    <section className="flex flex-col">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen(!open)}
        className="group flex cursor-pointer flex-col gap-1.5 rounded-sm text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-500 pointer-coarse:min-h-11 pointer-coarse:justify-center"
      >
        <span className="flex w-full items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500 transition-colors group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white">
            {title}
          </span>
          <span aria-hidden={true} className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
          <span className="font-mono text-xs font-bold tabular-nums text-gray-700 dark:text-gray-300">{count}</span>
          <LuChevronDown
            aria-hidden={true}
            className={twMerge(
              "size-4 shrink-0 text-gray-500 transition-[transform,color] duration-150 group-hover:text-gray-900 motion-reduce:transition-none dark:text-gray-400 dark:group-hover:text-white",
              !open && "-rotate-90",
            )}
          />
        </span>
        {!open && <span className="block text-sm text-gray-700 dark:text-gray-300">{summary}</span>}
      </button>

      <div id={contentId} hidden={!open}>
        {children}
      </div>
    </section>
  );
}
