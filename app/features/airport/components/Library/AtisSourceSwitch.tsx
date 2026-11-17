import type { AtisSource } from "~/features/airport";
import { AtisSourceLabel } from "~/features/airport/components/Library/AtisSourceLabel";
import { SourceSwitch } from "~/features/airport/components/Library/SourceSwitch";

type Props = {
  sources: AtisSource[];
  selected: AtisSource;
  onSelect: (source: AtisSource) => void;
};

export function AtisSourceSwitch({ sources, selected, onSelect }: Props) {
  return (
    <SourceSwitch
      label="ATIS source"
      sources={sources}
      selected={selected}
      onSelect={onSelect}
      renderSource={(source) => <AtisSourceLabel source={source} />}
    />
  );
}
