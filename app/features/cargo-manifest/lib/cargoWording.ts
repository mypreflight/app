import {
  type ColdChain,
  ColdChainReasonKind,
  ColdChainSolution,
  type NetQuantity,
  type ResponseCode,
} from "~/features/cargo-manifest/model";

type Assessment = Pick<ColdChain, "reason" | "solution" | "enduranceHours" | "exposureHours" | "marginHours">;

const solutionPhrases: Record<ColdChainSolution, string> = {
  [ColdChainSolution.Active]: "an active container",
  [ColdChainSolution.DryIce]: "a dry ice pack",
  [ColdChainSolution.Passive]: "a passive shipper",
};

function articleFor(hours: number): string {
  const digits = String(Math.floor(hours));

  return digits.startsWith("8") || digits === "11" || digits === "18" ? "An" : "A";
}

function capitalise(phrase: string): string {
  return `${phrase.charAt(0).toUpperCase()}${phrase.slice(1)}`;
}

export function netQuantityOf({ amount, unit }: NetQuantity): string {
  return `${amount} ${unit}`;
}

export function coldChainExplanationOf({
  reason,
  solution,
  enduranceHours,
  exposureHours,
  marginHours,
}: Assessment): string {
  const phrase = solutionPhrases[solution];

  switch (reason.kind) {
    case ColdChainReasonKind.EnduranceExceeded:
      return `Exposure of ${exposureHours} h exceeds the ${enduranceHours} h endurance of ${phrase}.`;
    case ColdChainReasonKind.HotTransfer:
      return `${reason.ambientC} °C at the transfer point exceeds what ${phrase} is validated for.`;
    case ColdChainReasonKind.LongConnection:
      return `${articleFor(reason.connectionHours)} ${reason.connectionHours} h connection leaves the shipment on ${phrase} longer than it should be.`;
    case ColdChainReasonKind.ThinMargin:
      return `${capitalise(phrase)} with ${marginHours} h margin on a ${enduranceHours} h endurance; no cooling available in flight.`;
    case ColdChainReasonKind.WithinMargin:
      return `${capitalise(phrase)} with ${marginHours} h margin on a ${enduranceHours} h endurance.`;
  }
}

export function responseCodeOf({ drillNumber, drillLetters }: ResponseCode): string {
  return `${drillNumber}${drillLetters.join("")}`;
}
