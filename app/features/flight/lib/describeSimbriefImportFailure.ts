import { isServerFailure, unreachableServiceMessage } from "~/features/auth/lib/serviceFailureMessages";

type FailureReason = {
  statusCode?: number;
  message?: unknown;
};

const refusals: [reported: string, message: string][] = [
  ["has not connected simbrief id", "Add your SimBrief ID in your account first."],
  [
    "simbrief account with given id does not exist",
    "SimBrief doesn’t recognise your SimBrief ID. Check it in your account.",
  ],
  ["operator with given icao code not found", "MyPreflight doesn’t have this plan’s airline yet."],
  ["airframe with given type not found", "MyPreflight doesn’t support this plan’s aircraft type yet."],
  [
    "does not name the aircraft registration and type",
    "The plan has no aircraft registration or type. Add them in SimBrief, generate the plan again and retry.",
  ],
  ["flight is already in progress", "Close your current flight before importing another plan."],
];

function reportedMessage(failure: FailureReason): string | null {
  return typeof failure.message === "string" ? failure.message : null;
}

export function describeSimbriefImportFailure(reason: unknown): string {
  const failure = (reason ?? {}) as FailureReason;

  if (failure.statusCode === undefined) {
    return unreachableServiceMessage;
  }

  if (failure.statusCode === 502) {
    return "SimBrief didn’t answer. Try again in a moment.";
  }

  if (isServerFailure(failure.statusCode)) {
    return "The import failed on our side. Try again in a moment.";
  }

  const reported = reportedMessage(failure);
  const refusal = refusals.find(([expected]) => reported?.trim().toLowerCase().includes(expected));

  if (refusal) {
    return refusal[1];
  }

  if (failure.statusCode === 409 && reported !== null) {
    return reported;
  }

  return "The plan couldn’t be imported. Check it in SimBrief and try again.";
}
