import type { Decorator } from "@storybook/react-vite";
import React from "react";
import { ShellSlot, ShellSlotsProvider, useShellSlotTarget } from "~/app-state/useShellSlots";
import { AppBottomBar } from "~/shared/ui/Shell/AppBottomBar";

function BottomBar() {
  return <AppBottomBar contentRef={useShellSlotTarget(ShellSlot.BottomBar)} />;
}

export const withBottomBar: Decorator = (Story) => (
  <ShellSlotsProvider>
    <Story />
    <BottomBar />
  </ShellSlotsProvider>
);
