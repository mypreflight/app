import React, { type ReactNode, type Ref } from "react";

type Props = {
  contentRef?: Ref<HTMLElement>;
  children?: ReactNode;
};

export function AppBottomBar({ contentRef, children }: Props) {
  return (
    <footer ref={contentRef} className="hidden min-w-0 pt-2 md:not-empty:block">
      {children}
    </footer>
  );
}
