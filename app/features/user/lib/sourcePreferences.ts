import type { IconType } from "react-icons";
import { LuBadgeCheck, LuSparkles } from "react-icons/lu";
import {
  AtisSource,
  atisSourceProvider,
  resolveAtisSource,
  resolveWeatherSource,
  WeatherSource,
} from "~/features/airport/model";
import type { User } from "~/features/user/model";

export type SourcePreference = "defaultWeatherSource" | "defaultAtisSource";

export type SourceOption = {
  value: string;
  label: string;
  icon: IconType;
  description: string;
};

export type SourcePreferenceCopy = {
  label: string;
  changeLabel: string;
  context: string;
  explanation: string;
  changed: string;
  intro: string;
  failure: string;
  options: SourceOption[];
  current: (user: User) => string;
};

export const SOURCE_PREFERENCES: Record<SourcePreference, SourcePreferenceCopy> = {
  defaultWeatherSource: {
    label: "Airport weather source",
    changeLabel: "Change weather source",
    context: "Weather source",
    explanation:
      "Airport weather opens on this provider. Say Intentions publishes ATIS alongside METAR and TAF; AviationWeather publishes METAR and TAF only.",
    changed: "Weather source changed. Airport weather now opens on this provider.",
    intro:
      "Airport weather opens on the provider you choose here. You can still switch source on any airport without changing this preference.",
    failure: "Weather source could not be changed. Try again in a moment.",
    options: [
      {
        value: WeatherSource.AviationWeatherGov,
        label: "AviationWeather",
        icon: LuBadgeCheck,
        description: "Real-world observations from AviationWeather service. Publishes METAR and TAF data.",
      },
      {
        value: WeatherSource.SayIntentions,
        label: "SayIntentions AI",
        icon: LuSparkles,
        description: "Weather used by Say Intentions AI service. Publishes ATIS alongside METAR and TAF.",
      },
    ],
    current: (user) => resolveWeatherSource(user.defaultWeatherSource),
  },
  defaultAtisSource: {
    label: "ATIS source",
    changeLabel: "Change ATIS source",
    context: "ATIS source",
    explanation:
      "Each airport's ATIS, and the runways it puts in use, open on this source. When it has no ATIS for an airport, the briefing shows the other one.",
    changed: "ATIS source changed. Each airport's ATIS now opens on this source.",
    intro:
      "Each airport's ATIS, and the runways it puts in use, open on the source you choose here. When it has no ATIS for an airport, the briefing shows the other one, and you can switch on any airport or runway picker.",
    failure: "ATIS source could not be changed. Try again in a moment.",
    options: [
      {
        value: atisSourceProvider(AtisSource.SayIntentions),
        label: "SayIntentions AI",
        icon: LuSparkles,
        description: "The ATIS Say Intentions' AI controllers read out.",
      },
      {
        value: atisSourceProvider(AtisSource.Real),
        label: "Real",
        icon: LuBadgeCheck,
        description:
          "The newest real digital ATIS: the FAA's for US airports, or one an aircraft requested over datalink in the last 6 hours (atis.guru).",
      },
    ],
    current: (user) => atisSourceProvider(resolveAtisSource(user.defaultAtisSource)),
  },
};

export function sourceOption(copy: SourcePreferenceCopy, value: string): SourceOption {
  return copy.options.find((option) => option.value === value) ?? copy.options[0];
}
