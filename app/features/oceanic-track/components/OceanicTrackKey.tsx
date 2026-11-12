import { useThemeMode } from "flowbite-react";
import { oceanicTrackColor } from "~/features/oceanic-track/lib/oceanicTrackOverlay";
import { translateOceanicDirection } from "~/features/route/i18n";
import { OceanicDirection } from "~/features/route/model";

const DIRECTIONS = [OceanicDirection.West, OceanicDirection.East];

export function OceanicTrackKey() {
  const { computedMode } = useThemeMode();
  const theme = computedMode === "dark" ? "dark" : "light";

  return (
    <ul className="flex gap-4 text-2xs text-gray-500 dark:text-gray-400">
      {DIRECTIONS.map((direction) => (
        <li key={direction} className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="h-1 w-4 rounded-full"
            style={{ backgroundColor: oceanicTrackColor(direction, theme) }}
          />
          {translateOceanicDirection(direction)}
        </li>
      ))}
    </ul>
  );
}
