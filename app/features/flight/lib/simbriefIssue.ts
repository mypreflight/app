import { MONTHS_SHORT_UPPER } from "~/shared/lib/date";

export type SimbriefIssue = {
  number: number;
  issuedAt: Date;
};

const OFP_NUMBER = /\nOFP (\d+) /;
const OFP_RELEASE = /RELEASE (\d{2})(\d{2}) (\d{2})([A-Z]{3})(\d{2})/;
const TLR_ISSUE = /TLR-(\d+) SEQ-\d+ (\d{2})([A-Z]{3})(\d{2}) (\d{2})(\d{2})Z/;

function utcDate(day: string, month: string, year: string, hours: string, minutes: string): Date | null {
  const monthIndex = MONTHS_SHORT_UPPER.indexOf(month);

  if (monthIndex === -1) {
    return null;
  }

  return new Date(Date.UTC(2000 + Number(year), monthIndex, Number(day), Number(hours), Number(minutes)));
}

export function ofpIssue(ofpContent: string): SimbriefIssue | null {
  const release = ofpContent.match(OFP_RELEASE);

  if (release === null) {
    return null;
  }

  const [, hours, minutes, day, month, year] = release;
  const issuedAt = utcDate(day, month, year, hours, minutes);

  return issuedAt === null ? null : { number: Number(ofpContent.match(OFP_NUMBER)?.[1] ?? 1), issuedAt };
}

export function runwayAnalysisIssue(runwayAnalysis: string): SimbriefIssue | null {
  const issue = runwayAnalysis.match(TLR_ISSUE);

  if (issue === null) {
    return null;
  }

  const [, number, day, month, year, hours, minutes] = issue;
  const issuedAt = utcDate(day, month, year, hours, minutes);

  return issuedAt === null ? null : { number: Number(number), issuedAt };
}
