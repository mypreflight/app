import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { useSidebar } from "~/app-state/useSidebar";

const MAXIMIZED_CLASS =
  "fixed inset-0 z-50 h-auto w-auto overflow-hidden bg-gray-100 dark:bg-gray-900 md:top-2 md:right-2 md:bottom-[max(0.5rem,env(safe-area-inset-bottom))] md:rounded-2xl md:border md:border-gray-200 md:dark:border-gray-800";
const EXPANDED_SIDEBAR_OFFSET = "md:left-60 xl:left-72";
const COLLAPSED_SIDEBAR_OFFSET = "md:left-2";

export function useMapMaximize() {
  const [isMaximized, setIsMaximized] = useState(false);
  const { isCollapsed } = useSidebar();
  const containerRef = useRef<HTMLDivElement>(null);
  const hasMounted = useRef(false);

  useLayoutEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    const element = containerRef.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const from = isMaximized
      ? { opacity: 0.5, transform: "scale(0.985)" }
      : { opacity: 0.6, transform: "scale(1.008)" };

    element.animate([from, { opacity: 1, transform: "scale(1)" }], {
      duration: 220,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    });
  }, [isMaximized]);

  const toggle = useCallback(() => setIsMaximized((value) => !value), []);

  return {
    isMaximized,
    toggle,
    containerRef,
    containerClassName: isMaximized
      ? `${MAXIMIZED_CLASS} ${isCollapsed ? COLLAPSED_SIDEBAR_OFFSET : EXPANDED_SIDEBAR_OFFSET}`
      : "",
  };
}
