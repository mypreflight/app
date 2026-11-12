import { useLayoutEffect, useRef, useState } from "react";

type Size = {
  width: number;
  height: number;
};

export function useElementSize<Element extends HTMLElement>() {
  const ref = useRef<Element>(null);
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const measure = () => {
      const { width, height } = element.getBoundingClientRect();
      setSize((current) =>
        current.width === Math.round(width) && current.height === Math.round(height)
          ? current
          : { width: Math.round(width), height: Math.round(height) },
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return { ref, ...size };
}
