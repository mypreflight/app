import { Button } from "flowbite-react";
import { HiRefresh } from "react-icons/hi";

export const CHANGELOG_URL = "https://mypreflight.io/changelog/";

type Props = {
  onReload: () => void;
};

export function UpdateNotice({ onReload }: Props) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(6rem+env(safe-area-inset-bottom))] z-50 flex justify-center px-3 md:bottom-6">
      <section
        aria-live="polite"
        className="pointer-events-auto flex w-full max-w-2xl flex-wrap items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-900"
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
          <HiRefresh aria-hidden className="size-5" />
        </div>
        <p className="min-w-0 flex-1 text-sm font-semibold text-gray-900 dark:text-white">
          A new version is available.
        </p>
        <div className="ms-auto flex w-full shrink-0 justify-end gap-2 sm:w-auto">
          <Button as="a" href={CHANGELOG_URL} target="_blank" rel="noopener noreferrer" color="subtle">
            What's new
          </Button>
          <Button color="indigo" onClick={onReload}>
            Reload
          </Button>
        </div>
      </section>
    </div>
  );
}
