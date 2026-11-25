import { HoldDeckName, type LoadingPosition, PositionSide } from "~/features/cargo-hold/model";

const SIDE_SUFFIX: Record<PositionSide, string> = {
  [PositionSide.Left]: "L",
  [PositionSide.Right]: "R",
  [PositionSide.Full]: "P",
};

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function designatorOf({ deck, compartment, row, side }: LoadingPosition): string {
  const ordinal = deck === HoldDeckName.Main ? LETTERS[row - 1] : `${compartment}${row}`;

  return `${ordinal}${SIDE_SUFFIX[side]}`;
}

export function samePosition(one: LoadingPosition, other: LoadingPosition): boolean {
  return (
    one.deck === other.deck && one.compartment === other.compartment && one.row === other.row && one.side === other.side
  );
}
