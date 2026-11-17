import { allWeatherSources, type WeatherSource } from "~/features/airport";
import { SourceSwitch } from "~/features/airport/components/Library/SourceSwitch";
import { WeatherSourceLabel } from "~/features/airport/components/Library/WeatherSourceLabel";

type Props = {
  selected: WeatherSource;
  onSelect: (source: WeatherSource) => void;
};

export function WeatherSourceSwitch({ selected, onSelect }: Props) {
  return (
    <SourceSwitch
      label="Weather source"
      sources={allWeatherSources()}
      selected={selected}
      onSelect={onSelect}
      renderSource={(source) => <WeatherSourceLabel source={source} />}
    />
  );
}
