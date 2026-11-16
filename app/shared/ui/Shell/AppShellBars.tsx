import React, { type ReactNode } from "react";
import { useAuth } from "~/app-state/useAuth";
import { ShellSlot, useShellSlotTarget } from "~/app-state/useShellSlots";
import { useAppEnvironment } from "~/shared/hooks/useAppEnvironment";
import { AppBottomBar } from "~/shared/ui/Shell/AppBottomBar";
import { AppTopBar } from "~/shared/ui/Shell/AppTopBar";

export function AppShellBars({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { discordInvitationHash } = useAppEnvironment();
  const topBarRef = useShellSlotTarget(ShellSlot.TopBar);
  const bottomBarRef = useShellSlotTarget(ShellSlot.BottomBar);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col md:me-2 md:pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      {user !== null && (
        <AppTopBar
          account={{ name: user.name, email: user.email }}
          discordInviteUrl={discordInvitationHash ? `https://discord.gg/${discordInvitationHash}` : null}
          contentRef={topBarRef}
        />
      )}
      {children}
      <AppBottomBar contentRef={bottomBarRef} />
    </div>
  );
}
