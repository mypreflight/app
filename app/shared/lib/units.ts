const FEET_PER_METRE = 3.28084;

export function metresToFeet(metres: number): number {
  return Math.round(metres * FEET_PER_METRE);
}
