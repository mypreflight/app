import {
  type AirportWeatherReport,
  AtisSource,
  allAtisInformationTypes,
  allAtisSources,
  WeatherInformationType,
  WeatherSource,
} from "~/features/airport/model";

export type AtisEnd = "departure" | "arrival";

export type RunwayUse = {
  arrival: boolean;
  departure: boolean;
};

const ATIS_TYPES_FOR: Record<AtisEnd, WeatherInformationType[]> = {
  departure: [WeatherInformationType.AtisDeparture, WeatherInformationType.Atis],
  arrival: [WeatherInformationType.AtisArrival, WeatherInformationType.Atis],
};

const PROVIDERS: Record<AtisSource, WeatherSource[]> = {
  [AtisSource.SayIntentions]: [WeatherSource.SayIntentions],
  [AtisSource.Real]: [WeatherSource.FaaDatis, WeatherSource.AtisGuru],
};

const PHONETIC_LETTERS: Record<string, string> = {
  ALFA: "A",
  ALPHA: "A",
  BRAVO: "B",
  CHARLIE: "C",
  DELTA: "D",
  ECHO: "E",
  FOXTROT: "F",
  GOLF: "G",
  HOTEL: "H",
  INDIA: "I",
  JULIET: "J",
  JULIETT: "J",
  KILO: "K",
  LIMA: "L",
  MIKE: "M",
  NOVEMBER: "N",
  OSCAR: "O",
  PAPA: "P",
  QUEBEC: "Q",
  ROMEO: "R",
  SIERRA: "S",
  TANGO: "T",
  UNIFORM: "U",
  VICTOR: "V",
  WHISKEY: "W",
  WHISKY: "W",
  XRAY: "X",
  YANKEE: "Y",
  ZULU: "Z",
};

const SPOKEN_LETTER = new RegExp(`\\b(?:INFO(?:RMATION)?|ATIS)\\s+(${Object.keys(PHONETIC_LETTERS).join("|")})\\b`);
const CODED_LETTER = [/\bINFO(?:RMATION)?\s+([A-Z])\b/, /\bATIS\s+(?:[A-Z]{4}\s+)?([A-Z])\b/];

function providerReports(reports: AirportWeatherReport[], provider: WeatherSource, end: AtisEnd | null) {
  const fromProvider = reports.filter((report) => report.source === provider);
  const types = end === null ? allAtisInformationTypes() : ATIS_TYPES_FOR[end];
  const found = types.flatMap((type) => fromProvider.filter((report) => report.informationType === type));

  return end === null ? found : found.slice(0, 1);
}

function issuedAt(report: AirportWeatherReport): number {
  return new Date(report.publishedAt ?? report.lastFetched).getTime();
}

function newestIssue(reports: AirportWeatherReport[]): number {
  return Math.max(...reports.map(issuedAt));
}

export function atisReports(
  reports: AirportWeatherReport[],
  source: AtisSource,
  end: AtisEnd | null,
): AirportWeatherReport[] {
  const candidates = PROVIDERS[source]
    .map((provider) => providerReports(reports, provider, end))
    .filter((found) => found.length > 0);

  return candidates.sort((left, right) => newestIssue(right) - newestIssue(left))[0] ?? [];
}

export function atisSources(reports: AirportWeatherReport[], end: AtisEnd | null): AtisSource[] {
  return allAtisSources().filter((source) => atisReports(reports, source, end).length > 0);
}

export function preferredAtisSource(available: AtisSource[], preferred: AtisSource): AtisSource | null {
  return available.includes(preferred) ? preferred : (available[0] ?? null);
}

export function runwayUse(report: AirportWeatherReport | null, runwayId: string): RunwayUse {
  return {
    arrival: report?.arrivalRunways.includes(runwayId) ?? false,
    departure: report?.departureRunways.includes(runwayId) ?? false,
  };
}

export function runwaysInUse(report: AirportWeatherReport, end: AtisEnd): string[] {
  return end === "departure" ? report.departureRunways : report.arrivalRunways;
}

export function atisLetter(content: string): string | null {
  const text = content.toUpperCase();
  const spoken = text.match(SPOKEN_LETTER);

  if (spoken) {
    return PHONETIC_LETTERS[spoken[1]];
  }

  for (const pattern of CODED_LETTER) {
    const coded = text.match(pattern);

    if (coded) {
      return coded[1];
    }
  }

  return null;
}
