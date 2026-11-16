import { isSameUtcDay } from "~/shared/lib/date";
import { dateToIcaoDate } from "~/shared/ui/Date/FormattedIcaoDate";
import { dateToIcaoTime } from "~/shared/ui/Date/FormattedIcaoTime";

export function dateToZuluStamp(date: Date, now: Date = new Date()): string {
  const time = `${dateToIcaoTime(date)}Z`;

  return isSameUtcDay(date, now) ? time : `${dateToIcaoDate(date)} ${time}`;
}
