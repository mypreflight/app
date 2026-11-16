import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { expect, userEvent, within } from "storybook/test";
import { AccountMenu } from "~/shared/ui/Shell/AccountMenu";

const meta = {
  title: "Shared/Shell/Account menu",
  component: AccountMenu,
  args: {
    name: "Rick Doe",
    email: "cabin-crew@example.com",
    discordInviteUrl: "https://discord.gg/example",
  },
  decorators: [
    (Story) => (
      <div className="flex h-80 justify-end">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "The round button at the right end of the top bar. It carries the user's initials and opens a menu with the name and email, Settings, the Discord community, the Light, Dark and Auto theme switch, and Sign out.",
      },
    },
  },
} satisfies Meta<typeof AccountMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Closed: Story = {};

export const Open: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Account menu, Rick Doe" }));

    const body = within(canvasElement.ownerDocument.body);
    await expect(await body.findByText("cabin-crew@example.com")).toBeVisible();
    const settings = within(body.getByRole("menuitem", { name: "Settings" })).getByRole("link");
    const signOut = within(body.getByRole("menuitem", { name: "Sign out" })).getByRole("link");
    await expect(settings).toHaveAttribute("href", "/me/account");
    await expect(signOut).toHaveAttribute("href", "/sign-out");
    const discord = within(body.getByRole("menuitem", { name: "Discord community" })).getByRole("link");
    await expect(discord).toHaveAttribute("href", "https://discord.gg/example");
    await expect(body.getByRole("group", { name: "Theme" })).toBeVisible();
  },
};

export const WithoutDiscord: Story = {
  args: { discordInviteUrl: null },
};

export const LongName: Story = {
  args: {
    name: "Alexandra Maria Konstantinopoulou",
    email: "alexandra.konstantinopoulou@example.com",
  },
};
