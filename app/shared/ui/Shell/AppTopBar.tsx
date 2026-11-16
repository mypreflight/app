import React, { type ReactNode, type Ref } from "react";
import { AccountMenu } from "~/shared/ui/Shell/AccountMenu";

type Props = {
  account: { name: string; email: string };
  discordInviteUrl: string | null;
  contentRef?: Ref<HTMLDivElement>;
  children?: ReactNode;
};

export function AppTopBar({ account, discordInviteUrl, contentRef, children }: Props) {
  return (
    <header className="relative z-20 hidden min-h-13 items-center gap-5 py-2 md:flex">
      <div ref={contentRef} className="flex min-w-0 flex-1 items-center gap-5">
        {children}
      </div>
      <AccountMenu name={account.name} email={account.email} discordInviteUrl={discordInviteUrl} />
    </header>
  );
}
