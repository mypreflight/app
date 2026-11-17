import React from "react";
import { FaArrowsSpin } from "react-icons/fa6";
import { TilePlaceholder } from "~/shared/ui/Layout/TilePlaceholder";
import { PageHeader } from "~/shared/ui/Shell/PageHeader";

type Props = {
  hint: string;
};

export function PilotRotationUnavailable({ hint }: Props) {
  return (
    <>
      <PageHeader crumbs={[{ label: "Rotations", to: "/rotations" }, { label: "Rotation" }]} />
      <TilePlaceholder icon={FaArrowsSpin} hint={hint} />
    </>
  );
}
