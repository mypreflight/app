import { Dropdown, DropdownDivider, DropdownHeader, DropdownItem } from "flowbite-react";
import React from "react";
import { FaDiscord } from "react-icons/fa6";
import { LuArrowUpRight, LuLogOut, LuSettings } from "react-icons/lu";
import { Link } from "react-router";
import { getInitials } from "~/shared/lib/getInitials";
import { ThemeModeSwitch } from "~/shared/ui/Shell/ThemeModeSwitch";

type Props = {
  name: string;
  email: string;
  discordInviteUrl: string | null;
};

const MAX_INITIALS = 2;

export function AccountMenu({ name, email, discordInviteUrl }: Props) {
  return (
    <Dropdown
      label={name}
      arrowIcon={false}
      placement="bottom-end"
      renderTrigger={() => (
        <button
          type="button"
          aria-label={`Account menu, ${name}`}
          className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-xs font-bold tracking-wide text-white transition-[scale,box-shadow] duration-150 ease-out hover:ring-3 hover:ring-indigo-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 active:scale-[0.96] aria-expanded:ring-3 aria-expanded:ring-indigo-200 pointer-coarse:size-11 motion-reduce:transition-none dark:hover:ring-indigo-500/30 dark:focus-visible:ring-offset-gray-900 dark:aria-expanded:ring-indigo-500/40"
        >
          {getInitials(name).slice(0, MAX_INITIALS)}
        </button>
      )}
    >
      <DropdownHeader>
        <span className="block text-sm font-semibold text-gray-900 dark:text-white">{name}</span>
        <span className="block max-w-60 truncate text-xs text-gray-500 dark:text-gray-400">{email}</span>
      </DropdownHeader>
      <DropdownDivider />
      <DropdownItem as={Link} to="/me/account" icon={LuSettings}>
        Settings
      </DropdownItem>
      {discordInviteUrl !== null && (
        <DropdownItem as="a" href={discordInviteUrl} target="_blank" rel="noopener noreferrer" icon={FaDiscord}>
          <span className="flex-1">Discord community</span>
          <LuArrowUpRight size={14} className="ms-3 text-gray-400" aria-hidden={true} />
        </DropdownItem>
      )}
      <DropdownDivider />
      <li role="none" className="min-w-56 px-3 py-1.5">
        <ThemeModeSwitch />
      </li>
      <DropdownDivider />
      <DropdownItem as={Link} to="/sign-out" viewTransition icon={LuLogOut}>
        Sign out
      </DropdownItem>
    </Dropdown>
  );
}
