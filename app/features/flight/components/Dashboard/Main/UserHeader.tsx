import React from "react";
import { useAuth } from "~/app-state/useAuth";
import { ShellSlot, ShellSlotPortal } from "~/app-state/useShellSlots";
import type { User } from "~/features/user/model";
import { TransparentContainer } from "~/shared/ui/Layout/TransparentContainer";

function greetingForHour(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function UserHeader() {
  const { user } = useAuth() as { user: User };

  const [name] = user.name.split(" ");
  const greeting = greetingForHour(new Date().getHours());

  return (
    <>
      <ShellSlotPortal slot={ShellSlot.TopBar}>
        <h1 className="truncate text-sm font-semibold text-gray-900 dark:text-white">
          <span className="font-normal text-gray-600 dark:text-gray-400">{greeting},</span> {name}
        </h1>
      </ShellSlotPortal>
      <TransparentContainer chromeless className="pt-4 md:hidden">
        <h1>
          <span className="block text-sm font-medium text-gray-600 dark:text-gray-400">{greeting},</span>{" "}
          <span className="mt-1 block text-4xl font-bold tracking-tight text-gray-900 dark:text-white">{name}</span>
        </h1>
      </TransparentContainer>
    </>
  );
}
