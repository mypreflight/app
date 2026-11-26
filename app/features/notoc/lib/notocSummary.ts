import type { SpecialHandlingCode } from "~/features/cargo-manifest/model";
import type { SpecialServiceRequest } from "~/features/flight/model";
import { DRY_ICE } from "~/features/notoc/lib/notocFormat";
import { groupSpecialPassengers } from "~/features/notoc/lib/specialPassengerGroups";
import type { NotocDangerousGoods, NotocDryIce, NotocSpecialLoad, NotocSpecialPassenger } from "~/features/notoc/model";

export type Tally<Item> = {
  item: Item;
  count: number;
};

function tallyOf<Item>(items: Item[]): Tally<Item>[] {
  const counts = new Map<Item, number>();

  for (const item of items) {
    counts.set(item, (counts.get(item) ?? 0) + 1);
  }

  return [...counts].map(([item, count]) => ({ item, count }));
}

export function dangerousGoodsTally(dangerousGoods: NotocDangerousGoods[], dryIce: NotocDryIce[]): Tally<string>[] {
  return tallyOf([
    ...dangerousGoods.map((entry) => entry.properShippingName),
    ...dryIce.map(() => DRY_ICE.properShippingName),
  ]);
}

export function specialHandlingCodesOf(loads: NotocSpecialLoad[]): SpecialHandlingCode[] {
  return [...new Set(loads.flatMap((load) => load.shc))];
}

export function specialPassengerTally(passengers: NotocSpecialPassenger[]): Tally<SpecialServiceRequest>[] {
  return tallyOf(groupSpecialPassengers(passengers).flatMap((group) => group.seats.map(() => group.ssr)));
}
