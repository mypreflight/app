import type { IconType } from "react-icons";
import { LuBadgeCheck, LuSparkles } from "react-icons/lu";
import { AtisSource } from "~/features/airport";
import { translateAtisSource } from "~/features/airport/i18n";

const sourceIcons: Record<AtisSource, IconType> = {
  [AtisSource.SayIntentions]: LuSparkles,
  [AtisSource.Real]: LuBadgeCheck,
};

export function AtisSourceLabel({ source }: { source: AtisSource }) {
  const Icon = sourceIcons[source];

  return (
    <span className="inline-flex items-center gap-1">
      <Icon aria-hidden className="size-3.5 shrink-0" />
      {translateAtisSource(source)}
    </span>
  );
}
