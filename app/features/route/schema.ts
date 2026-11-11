import { date, number, object } from "yup";
import { latestAtUtcClockTime } from "~/shared/lib/time";
import { dateToIcaoTime } from "~/shared/ui/Date/FormattedIcaoTime";

const ENTER_TIME = "Enter the time as HH:mm";

const fuelOnBoard = number()
  .transform((value, original) => (original === "" ? undefined : value))
  .typeError("Fuel on board must be a number")
  .required("Fuel on board is required")
  .min(0, "Cannot be negative")
  .max(999.999, "Cannot be more than 999.999 t")
  .test(
    "max-decimals",
    "Maximum 3 decimal places allowed",
    (value) => value === undefined || Math.round(value * 1000) / 1000 === value,
  );

function readingTime(takeoffTime: Date | null) {
  const time = date()
    .transform((value, original) =>
      typeof original === "string" ? (latestAtUtcClockTime(original, new Date()) ?? new Date(Number.NaN)) : value,
    )
    .typeError(ENTER_TIME)
    .required(ENTER_TIME);

  if (takeoffTime === null) {
    return time;
  }

  return time.min(takeoffTime, `Must be between takeoff (${dateToIcaoTime(takeoffTime)}Z) and now`);
}

export function fixFuelReportSchema(takeoffTime: Date | null) {
  return object({
    actualOnBoard: fuelOnBoard,
    reportedAt: readingTime(takeoffTime),
  });
}
