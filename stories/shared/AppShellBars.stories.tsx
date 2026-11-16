import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { type AuthContextType, UseAuth } from "~/app-state/useAuth";
import { ShellSlot, ShellSlotPortal, ShellSlotsProvider } from "~/app-state/useShellSlots";
import { BriefingRecordsStrip } from "~/features/flight/components/Briefing/BriefingRecordsStrip";
import { BriefingDocument } from "~/features/flight/lib/briefingPhase";
import type { User } from "~/features/user/model";
import { AppShellBars } from "~/shared/ui/Shell/AppShellBars";

const OUTLET = (
  <main className="flex flex-1 items-center justify-center rounded-2xl border border-gray-200 bg-gray-100 text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400">
    Outlet
  </main>
);

const signedIn = {
  user: { name: "Rick Doe", email: "cabin-crew@example.com" } as User,
  isLoading: false,
} as AuthContextType;

const meta = {
  title: "Shared/Shell/Shell bars",
  component: AppShellBars,
  decorators: [
    (Story) => (
      <UseAuth.Provider value={signedIn}>
        <ShellSlotsProvider>
          <div className="flex h-96">
            <Story />
          </div>
        </ShellSlotsProvider>
      </UseAuth.Provider>
    ),
  ],
  args: {
    children: OUTLET,
  },
  parameters: {
    docs: {
      description: {
        component:
          "Wraps the outlet in `AppLayout`: the top bar with the signed-in user's account menu above it, and the bottom bar below it once a page fills it. Both bars show from `md` up.",
      },
    },
  },
} satisfies Meta<typeof AppShellBars>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithABottomBar: Story = {
  args: {
    children: (
      <>
        {OUTLET}
        <ShellSlotPortal slot={ShellSlot.BottomBar}>
          <BriefingRecordsStrip
            load={[{ document: BriefingDocument.Cargo, label: "Cargo", href: "#cargo" }]}
            records={[{ document: BriefingDocument.Timesheet, label: "Timesheet", href: "#timesheet" }]}
            canDeclareEmergency={false}
            canReportDiversion={false}
            onDeclareEmergency={() => {}}
            onReportDiversion={() => {}}
          />
        </ShellSlotPortal>
      </>
    ),
  },
};
