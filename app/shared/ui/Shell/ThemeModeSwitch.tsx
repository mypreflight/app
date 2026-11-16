import React from "react";
import type { IconType } from "react-icons";
import { LuMoon, LuSun, LuSunMoon } from "react-icons/lu";
import { twMerge } from "tailwind-merge";
import { type ThemeMode, useThemeSwitch } from "~/shared/hooks/useThemeSwitch";

const THEME_MODES: { mode: ThemeMode; label: string; icon: IconType }[] = [
  { mode: "light", label: "Light", icon: LuSun },
  { mode: "dark", label: "Dark", icon: LuMoon },
  { mode: "auto", label: "Auto", icon: LuSunMoon },
];

export function ThemeModeSwitch() {
  const { mode: current, setMode } = useThemeSwitch();

  return (
    <fieldset className="grid grid-cols-3 gap-0.5 rounded-lg border border-gray-200 bg-gray-50 p-0.5 dark:border-gray-600 dark:bg-gray-800">
      <legend className="sr-only">Theme</legend>
      {THEME_MODES.map(({ mode, label, icon: Icon }) => (
        <button
          key={mode}
          type="button"
          onClick={() => setMode(mode)}
          aria-pressed={current === mode}
          className={twMerge(
            "flex cursor-pointer items-center justify-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-gray-500 transition-colors duration-150 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 pointer-coarse:py-2.5 dark:text-gray-400 dark:hover:text-white",
            current === mode &&
              "bg-white text-indigo-700 shadow-xs hover:text-indigo-700 dark:bg-gray-600 dark:text-white dark:hover:text-white",
          )}
        >
          <Icon size={13} aria-hidden={true} />
          {label}
        </button>
      ))}
    </fieldset>
  );
}
