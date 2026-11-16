import React, { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { createPortal } from "react-dom";

export enum ShellSlot {
  TopBar = "topBar",
  SidebarStatus = "sidebarStatus",
  BottomBar = "bottomBar",
}

type Targets = Record<ShellSlot, HTMLElement | null>;

type ShellSlots = {
  targets: Targets;
  setTarget: (slot: ShellSlot, node: HTMLElement | null) => void;
};

const NO_TARGETS: Targets = {
  [ShellSlot.TopBar]: null,
  [ShellSlot.SidebarStatus]: null,
  [ShellSlot.BottomBar]: null,
};

const ShellSlotsContext = createContext<ShellSlots | null>(null);

export function ShellSlotsProvider({ children }: { children: ReactNode }) {
  const [targets, setTargets] = useState<Targets>(NO_TARGETS);

  const setTarget = useCallback(
    (slot: ShellSlot, node: HTMLElement | null) =>
      setTargets((current) => (current[slot] === node ? current : { ...current, [slot]: node })),
    [],
  );

  const value = useMemo(() => ({ targets, setTarget }), [targets, setTarget]);

  return <ShellSlotsContext.Provider value={value}>{children}</ShellSlotsContext.Provider>;
}

export function useShellSlotTarget(slot: ShellSlot): ((node: HTMLElement | null) => void) | undefined {
  const setTarget = useContext(ShellSlotsContext)?.setTarget;

  return useMemo(
    () => (setTarget === undefined ? undefined : (node: HTMLElement | null) => setTarget(slot, node)),
    [setTarget, slot],
  );
}

export function ShellSlotPortal({ slot, children }: { slot: ShellSlot; children: ReactNode }) {
  const target = useContext(ShellSlotsContext)?.targets[slot] ?? null;

  return target === null ? null : createPortal(children, target);
}
