import type { NotocHeader } from "~/features/notoc/model";

export function notocFileName(header: NotocHeader): string {
  const [year, month, day] = header.flightDate.split("-");

  return `NOTOC-${header.flightNumber}-${year}${month}${day}.pdf`;
}
