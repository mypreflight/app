import type { Crumb } from "~/shared/ui/Section/Breadcrumbs";

const OPERATOR_EDIT_PARAM = "edit";
const OPERATOR_EDIT_VALUE = "operator";

export const operatorTabs = [
  { title: "Fleet", path: "fleet" },
  { title: "Rotations", path: "rotations" },
] as const;

export type OperatorTab = (typeof operatorTabs)[number]["path"];

export function operatorTabPath(operatorId: string, tab: OperatorTab): string {
  return `/operators/${operatorId}/${tab}`;
}

export function activeOperatorTab(pathname: string): OperatorTab {
  return operatorTabs.find((tab) => pathname.includes(tab.path))?.path ?? "fleet";
}

export function operatorCrumbs(operator: { id: string; shortName: string }, tab: OperatorTab): Crumb[] {
  const title = operatorTabs.find((entry) => entry.path === tab)?.title ?? tab;

  return [
    { label: "Operators", to: "/operators" },
    { label: operator.shortName, to: operatorTabPath(operator.id, "fleet") },
    { label: title, to: operatorTabPath(operator.id, tab) },
  ];
}

export function operatorEditPath(pathname: string): string {
  return `${pathname}?${OPERATOR_EDIT_PARAM}=${OPERATOR_EDIT_VALUE}`;
}

export function isOperatorEditRequested(searchParams: URLSearchParams): boolean {
  return searchParams.get(OPERATOR_EDIT_PARAM) === OPERATOR_EDIT_VALUE;
}
