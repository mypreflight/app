import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { ThemeModeSwitch } from "~/shared/ui/Shell/ThemeModeSwitch";

const meta = {
  title: "Shared/Shell/Theme mode switch",
  component: ThemeModeSwitch,
  parameters: {
    docs: {
      description: {
        component:
          "Light, Dark and Auto in the account menu. The pressed one is the current mode; Auto follows the system. Storybook's own theme switch overrides it here.",
      },
    },
  },
} satisfies Meta<typeof ThemeModeSwitch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const group = within(within(canvasElement).getByRole("group", { name: "Theme" }));
    await expect(group.getAllByRole("button")).toHaveLength(3);
    await expect(group.getAllByRole("button", { pressed: true })).toHaveLength(1);
  },
};
