import React from "react";
import type { NotocHeader } from "~/features/notoc/model";
import { FormattedIcaoDate } from "~/shared/ui/Date/FormattedIcaoDate";
import { FieldLabel } from "~/shared/ui/Display/FieldLabel";

type Props = {
  header: NotocHeader;
  stationOfUnloading: string;
};

function Field({ label, value, caption }: { label: string; value: React.ReactNode; caption?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt>
        <FieldLabel>{label}</FieldLabel>
      </dt>
      <dd className="font-mono text-sm font-bold text-gray-900 dark:text-white">{value}</dd>
      {caption !== undefined && <dd className="text-xs text-gray-500 dark:text-gray-400">{caption}</dd>}
    </div>
  );
}

export function NotocFormHeader({ header, stationOfUnloading }: Props) {
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-3 border-y border-gray-200 py-3 sm:grid-cols-4 dark:border-gray-800">
      <Field label="Port of loading" value={header.stationOfLoading} caption={header.stationOfLoadingCity} />
      <Field label="Unloading" value={stationOfUnloading} />
      <Field
        label="Flight"
        value={header.flightNumber}
        caption={<FormattedIcaoDate date={new Date(`${header.flightDate}T00:00:00Z`)} />}
      />
      <Field label="Aircraft" value={header.aircraftRegistration} caption={header.aircraftType} />
    </dl>
  );
}
