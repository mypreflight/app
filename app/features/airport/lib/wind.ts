import { type AirportWeatherReport, WeatherInformationType, type WeatherSource } from "~/features/airport/model";

export type Wind = {
  direction: number | null;
  speed: number;
};

export type WindComponents = {
  along: number;
  across: number;
};

const METAR_WIND = /\b(\d{3}|VRB)(\d{2,3})(?:G\d{2,3})?(KT|MPS|KMH)\b/;

const TO_KNOTS: Record<string, number> = {
  KT: 1,
  MPS: 1.943844,
  KMH: 0.539957,
};

export function metarWind(reports: AirportWeatherReport[], preferred: WeatherSource): Wind | null {
  const metars = reports.filter((report) => report.informationType === WeatherInformationType.Metar);
  const metar = metars.find((report) => report.source === preferred) ?? metars[0];
  const match = metar?.content.toUpperCase().match(METAR_WIND);

  if (!match) {
    return null;
  }

  return {
    direction: match[1] === "VRB" ? null : Number(match[1]),
    speed: Math.round(Number(match[2]) * TO_KNOTS[match[3]]),
  };
}

export function windComponents(wind: Wind, runwayHeading: number): WindComponents | null {
  if (wind.direction === null) {
    return null;
  }

  const angle = ((wind.direction - runwayHeading) * Math.PI) / 180;

  return {
    along: Math.round(wind.speed * Math.cos(angle)) || 0,
    across: Math.round(wind.speed * Math.sin(angle)) || 0,
  };
}
