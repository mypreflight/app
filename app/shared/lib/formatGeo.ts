export function formatLatitude(lat: number): string {
  const dir = lat >= 0 ? "N" : "S";
  return `${Math.abs(lat).toFixed(4)}°${dir}`;
}

export function formatLongitude(lon: number): string {
  const dir = lon >= 0 ? "E" : "W";
  return `${Math.abs(lon).toFixed(4)}°${dir}`;
}

export function formatCoordinates(lat: number, lon: number): string {
  return `${formatLatitude(lat)} · ${formatLongitude(lon)}`;
}

function degreesMinutes(value: number, degreeDigits: number, positive: string, negative: string): string {
  const hemisphere = value >= 0 ? positive : negative;
  const totalMinutes = Math.round(Math.abs(value) * 60 * 100) / 100;
  const degrees = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes - degrees * 60;

  return `${hemisphere}${String(degrees).padStart(degreeDigits, "0")}°${minutes.toFixed(2).padStart(5, "0")}′`;
}

export function formatPositionDdm(lat: number, lon: number): [string, string] {
  return [degreesMinutes(lat, 2, "N", "S"), degreesMinutes(lon, 3, "E", "W")];
}

export function getUtcOffset(timezone: string, date: Date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "shortOffset",
    });
    const parts = formatter.formatToParts(date);
    const offsetPart = parts.find((p) => p.type === "timeZoneName");
    return (offsetPart?.value ?? "").replace(/^GMT/, "UTC");
  } catch {
    return "";
  }
}
