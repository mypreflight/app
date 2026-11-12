import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { CHANGELOG_URL, UpdateNotice } from "~/shared/pwa/UpdateNotice";

const meta = {
  title: "Shared/UpdateNotice",
  component: UpdateNotice,
  args: { onReload: fn() },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
Shown in the installed app when a new version is waiting. A card centred at the bottom of the screen, above the
bottom navigation on phones. What's new opens the website changelog in a new tab; Reload applies the update.
`,
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="h-dvh bg-gray-100 dark:bg-gray-950">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof UpdateNotice>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Waiting: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("A new version is available.")).toBeVisible();
    await expect(canvas.getByRole("link", { name: "What's new" })).toHaveAttribute("href", CHANGELOG_URL);
    await userEvent.click(canvas.getByRole("button", { name: "Reload" }));
    await expect(args.onReload).toHaveBeenCalledOnce();
  },
};
