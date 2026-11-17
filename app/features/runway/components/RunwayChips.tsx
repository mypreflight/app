import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import { LuArrowDown, LuArrowLeft, LuArrowRight, LuArrowUp } from "react-icons/lu";
import type { AtisEnd, RunwayUse } from "~/features/airport/lib/atis";
import type { Wind, WindComponents } from "~/features/airport/lib/wind";

type Tone = "success" | "warning" | "neutral";

const EDGE: Record<Tone, string> = {
  success: "border-green-200 dark:border-green-900",
  warning: "border-amber-200 dark:border-amber-900",
  neutral: "border-gray-200 dark:border-gray-700",
};

const VALUE: Record<Tone, string> = {
  success: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  neutral: "bg-white text-gray-700 dark:bg-gray-900 dark:text-gray-200",
};

type ChipProps = {
  tone: Tone;
  top: ReactNode;
  spoken: string;
  children: ReactNode;
};

function Chip({ tone, top, spoken, children }: ChipProps) {
  return (
    <span
      className={`relative inline-flex min-w-16 shrink-0 flex-col overflow-hidden rounded-md border text-center ${EDGE[tone]}`}
    >
      <span className="sr-only">{spoken}</span>
      <span
        aria-hidden={true}
        className="flex h-4.5 items-center justify-center gap-1 bg-gray-100 px-1.5 text-2xs font-bold uppercase leading-none tracking-wide text-gray-700 *:[text-box:trim-both_cap_alphabetic] dark:bg-gray-800 dark:text-gray-200"
      >
        {top}
      </span>
      <span
        aria-hidden={true}
        className={`flex h-5 items-center justify-center gap-1.5 whitespace-nowrap px-1.5 text-2xs font-bold leading-none *:[text-box:trim-both_cap_alphabetic] ${VALUE[tone]}`}
      >
        {children}
      </span>
    </span>
  );
}

function Separator() {
  return <span className="h-2.5 w-px shrink-0 bg-current opacity-40" />;
}

function AtisTop({ letter }: { letter: string | null }) {
  return (
    <>
      <span>ATIS</span>
      {letter !== null && (
        <span className="rounded-sm bg-gray-700 px-1 py-0.5 font-mono tracking-normal text-white dark:bg-gray-200 dark:text-gray-900">
          {letter}
        </span>
      )}
    </>
  );
}

function atisName(letter: string | null): string {
  return letter === null ? "ATIS" : `ATIS ${letter}`;
}

export function AtisUseChip({ letter, use }: { letter: string | null; use: RunwayUse }) {
  if (!use.arrival && !use.departure) {
    return null;
  }

  const uses = [use.arrival && "arrival", use.departure && "departure"].filter(Boolean).join(" and ");

  return (
    <Chip tone="success" top={<AtisTop letter={letter} />} spoken={`${atisName(letter)}: in use for ${uses}`}>
      {use.arrival && <span className="uppercase tracking-wide">Arr</span>}
      {use.arrival && use.departure && <Separator />}
      {use.departure && <span className="uppercase tracking-wide">Dep</span>}
    </Chip>
  );
}

type AtisElsewhereChipProps = {
  letter: string | null;
  end: AtisEnd;
  designators: string[];
};

export function AtisElsewhereChip({ letter, end, designators }: AtisElsewhereChipProps) {
  if (designators.length === 0) {
    return null;
  }

  return (
    <Chip
      tone="warning"
      top={<AtisTop letter={letter} />}
      spoken={`${atisName(letter)}: ${end} from ${designators.join(", ")}, not this runway`}
    >
      <span className="uppercase tracking-wide">{end === "departure" ? "Dep" : "Arr"}</span>
      <span className="font-mono">{designators.join(" ")}</span>
    </Chip>
  );
}

function Knots({ value }: { value: number }) {
  return (
    <span className="[text-box:trim-both_cap_alphabetic]">
      <span className="font-mono">{value}</span>
      <span className="font-normal">kt</span>
    </span>
  );
}

function Component({ icon: Icon, value }: { icon: IconType | null; value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Icon !== null && <Icon className="size-3 shrink-0" strokeWidth={3} />}
      <Knots value={Math.abs(value)} />
    </span>
  );
}

function alongIcon(along: number): IconType | null {
  return along > 0 ? LuArrowDown : along < 0 ? LuArrowUp : null;
}

function acrossIcon(across: number): IconType | null {
  return across > 0 ? LuArrowLeft : across < 0 ? LuArrowRight : null;
}

function spokenWind(wind: Wind, components: WindComponents | null): string {
  if (wind.speed === 0) {
    return "Wind calm";
  }

  if (components === null) {
    return `Wind variable, ${wind.speed} knots`;
  }

  const along = components.along < 0 ? `tailwind ${-components.along}` : `headwind ${components.along}`;
  const across =
    components.across === 0
      ? "no crosswind"
      : `crosswind ${Math.abs(components.across)} from the ${components.across > 0 ? "right" : "left"}`;

  return `Wind: ${along} knots, ${across}`;
}

export function WindChip({ wind, components }: { wind: Wind; components: WindComponents | null }) {
  const tailwind = components !== null && components.along < 0;

  return (
    <Chip tone={tailwind ? "warning" : "neutral"} top={<span>Wind</span>} spoken={spokenWind(wind, components)}>
      {wind.speed === 0 ? (
        <span>Calm</span>
      ) : components === null ? (
        <span>
          VRB <Knots value={wind.speed} />
        </span>
      ) : (
        <>
          <Component icon={alongIcon(components.along)} value={components.along} />
          <Separator />
          <Component icon={acrossIcon(components.across)} value={components.across} />
        </>
      )}
    </Chip>
  );
}
