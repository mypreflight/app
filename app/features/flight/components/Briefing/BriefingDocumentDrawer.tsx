import React, { type ReactNode, useEffect, useId, useRef } from "react";
import { LuX } from "react-icons/lu";
import { twMerge } from "tailwind-merge";

export type DrawerWidth = "document" | "wide";

const WIDTHS: Record<DrawerWidth, string> = {
  document: "max-w-[45rem]",
  wide: "max-w-5xl",
};

type Props = {
  title: string;
  summary?: ReactNode;
  width?: DrawerWidth;
  returnFocusTo?: string;
  onClose: () => void;
  children: ReactNode;
};

function focusTarget(opener: HTMLElement | null, fallbackId: string | undefined): HTMLElement | null {
  if (opener !== null && opener !== document.body && opener.isConnected) {
    return opener;
  }

  return fallbackId === undefined ? null : document.getElementById(fallbackId);
}

export function BriefingDocumentDrawer({
  title,
  summary,
  width = "document",
  returnFocusTo,
  onClose,
  children,
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  const fallbackRef = useRef(returnFocusTo);
  fallbackRef.current = returnFocusTo;

  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    panelRef.current?.focus();

    return () => {
      focusTarget(opener, fallbackRef.current)?.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented && panelRef.current?.contains(document.activeElement)) {
        onClose();
      }
    };

    document.addEventListener("keydown", closeOnEscape);

    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return (
    <>
      <div aria-hidden={true} onClick={onClose} className="modal-scrim fixed inset-0 z-40" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal={true}
        aria-labelledby={titleId}
        tabIndex={-1}
        className={twMerge(
          "drawer-panel fixed inset-y-0 end-0 z-40 flex w-full flex-col border-s border-gray-200 bg-white pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300",
          WIDTHS[width],
        )}
      >
        <header className="flex items-start justify-between gap-3 border-b border-gray-200 px-5 py-3 dark:border-gray-800">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-bold text-gray-900 dark:text-white">
              {title}
            </h2>
            {summary && <p className="text-xs text-gray-500 dark:text-gray-400">{summary}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={`Close ${title}`}
            className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 pointer-coarse:size-11 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            <LuX className="size-4" aria-hidden={true} />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">{children}</div>
      </div>
    </>
  );
}
