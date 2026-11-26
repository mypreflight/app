import React from "react";
import { NotocIssuedAt } from "~/features/notoc/components/NotocIssuedAt";
import type { NotocHeader } from "~/features/notoc/model";
import { FieldLabel } from "~/shared/ui/Display/FieldLabel";

type Acceptance = {
  name: string;
  at: string;
};

type Props = {
  header: NotocHeader;
  acceptance: Acceptance | null;
};

function Signatory({ label, name, caption }: { label: string; name: string; caption: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <FieldLabel>{label}</FieldLabel>
      <span className="text-sm font-semibold text-gray-900 dark:text-white">{name}</span>
      <span className="text-xs text-gray-500 dark:text-gray-400">{caption}</span>
    </div>
  );
}

export function NotocCertification({ header, acceptance }: Props) {
  return (
    <section className="flex flex-col gap-4 border-t border-gray-200 pt-4 dark:border-gray-800">
      <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-3">
        <Signatory label="Prepared by" name={header.preparedBy} caption="Dangerous goods acceptance" />
        <Signatory
          label="Loading supervisor"
          name={header.loadingSupervisor}
          caption="Loaded as listed, nothing damaged or leaking"
        />
        {acceptance !== null && (
          <Signatory
            label="Accepted by captain"
            name={acceptance.name}
            caption={<NotocIssuedAt at={acceptance.at} />}
          />
        )}
      </div>

      <p className="flex flex-wrap items-baseline gap-x-2">
        <FieldLabel className="inline">Emergency telephone</FieldLabel>
        <span className="font-mono text-sm font-bold text-gray-900 dark:text-white">{header.emergencyTelephone}</span>
      </p>
    </section>
  );
}
