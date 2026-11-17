import type { ReactNode } from "react";

type Props<Source extends string> = {
  label: string;
  sources: Source[];
  selected: Source;
  onSelect: (source: Source) => void;
  renderSource: (source: Source) => ReactNode;
};

export function SourceSwitch<Source extends string>({
  label,
  sources,
  selected,
  onSelect,
  renderSource,
}: Props<Source>) {
  return (
    <fieldset
      aria-label={label}
      className="inline-flex min-w-0 max-w-full gap-0.5 overflow-x-auto rounded-lg border border-gray-200 p-0.5 dark:border-gray-800"
    >
      {sources.map((source) => (
        <button
          key={source}
          type="button"
          aria-pressed={source === selected}
          onClick={() => onSelect(source)}
          className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
            source === selected
              ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          {renderSource(source)}
        </button>
      ))}
    </fieldset>
  );
}
