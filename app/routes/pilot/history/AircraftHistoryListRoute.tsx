import React from "react";
import { UserAircraftHistoryTable } from "~/features/aircraft/components/Table/UserAircraftHistoryTable";
import { usePageTitle } from "~/shared/hooks/usePageTitle";
import { TransparentContainer } from "~/shared/ui/Layout/TransparentContainer";
import { PageHeader } from "~/shared/ui/Shell/PageHeader";

export default function AircraftHistoryListRoute() {
  usePageTitle("Aircraft history");

  return (
    <>
      <PageHeader title="Aircraft history" />
      <TransparentContainer>
        <UserAircraftHistoryTable />
      </TransparentContainer>
    </>
  );
}
