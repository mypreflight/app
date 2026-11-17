import React from "react";
import { TravelLogTable } from "~/features/flight/components/Table/TravelLogTable";
import { usePageTitle } from "~/shared/hooks/usePageTitle";
import { TransparentContainer } from "~/shared/ui/Layout/TransparentContainer";
import { PageHeader } from "~/shared/ui/Shell/PageHeader";

export default function TravelLogRoute() {
  usePageTitle("Travel log");

  return (
    <>
      <PageHeader title="Travel log" />
      <TransparentContainer>
        <TravelLogTable />
      </TransparentContainer>
    </>
  );
}
