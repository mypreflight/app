import { FaCircleCheck } from "react-icons/fa6";
import type { SimbriefAccount } from "~/features/user";
import { SimbriefPlanSummary } from "~/features/user/components/SimbriefPlanSummary";

type Props = {
  account: SimbriefAccount;
};

export function SimbriefAccountPreview({ account }: Props) {
  return (
    <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 dark:border-green-900 dark:bg-green-900/30">
      <p className="flex items-start gap-2 text-sm font-medium text-green-800 dark:text-green-300">
        <FaCircleCheck aria-hidden className="mt-0.5 shrink-0" />
        <span>SimBrief account verified, this is your recent flight plan.</span>
      </p>

      <SimbriefPlanSummary plan={account.latestFlight} className="mt-3" />
    </div>
  );
}
