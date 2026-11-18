import type { Route } from ".react-router/types/app/routes/operations/operators/aircraft/+types/AircraftDetailsRoute";
import { Button } from "flowbite-react";
import React, { useState } from "react";
import { HiCheck, HiPencil } from "react-icons/hi";
import { Link, Outlet, useLoaderData, useRevalidator } from "react-router";
import { useToast } from "~/app-state/useToast";
import { AircraftDetailsHeader } from "~/features/aircraft/components/AircraftDetails/AircraftDetailsHeader";
import { AircraftDetailsTabs } from "~/features/aircraft/components/AircraftDetails/AircraftDetailsTabs";
import type { AircraftDetailsContext } from "~/features/aircraft/components/AircraftDetails/aircraftDetailsContext";
import { ConfirmAircraftModal } from "~/features/aircraft/components/AircraftDetails/ConfirmAircraftModal";
import { AircraftService } from "~/features/aircraft/service";
import { operatorCrumbs } from "~/features/operator/navigation";
import { OperatorService } from "~/features/operator/service";
import { useApi } from "~/shared/api/useApi";
import { usePageTitle } from "~/shared/hooks/usePageTitle";
import { ContainerEmptyState } from "~/shared/ui/Layout/ContainerEmptyState";
import { PageHeader } from "~/shared/ui/Shell/PageHeader";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const aircraftService = new AircraftService();
  const aircraft = await aircraftService.fetchById(params.operatorId, params.aircraftId).catch(() => null);

  if (!aircraft) {
    return { aircraft: null, history: [], repositions: [], operator: null };
  }

  const [history, repositions, operator] = await Promise.all([
    aircraftService.fetchFlightHistory(params.operatorId, params.aircraftId),
    aircraftService.fetchRepositionHistory(params.operatorId, params.aircraftId),
    new OperatorService().fetchById(params.operatorId),
  ]);

  return { aircraft, history, repositions, operator };
}

export default function AircraftDetailsRoute({ params }: Route.ComponentProps) {
  const { aircraft, history, repositions, operator } = useLoaderData<typeof clientLoader>();
  const revalidator = useRevalidator();
  const { aircraftService } = useApi();
  const { success, error } = useToast();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  usePageTitle(aircraft ? `Aircraft ${aircraft.registration}` : "Aircraft not found");

  if (!aircraft || !operator) {
    return (
      <div className="pb-8">
        <PageHeader crumbs={[{ label: "Operators", to: "/operators" }, { label: "Aircraft" }]} />
        <ContainerEmptyState>
          This aircraft could not be found. It may have been removed from the fleet.
        </ContainerEmptyState>
      </div>
    );
  }

  async function handleConfirm() {
    if (!aircraft) return;

    setIsConfirming(true);

    try {
      await aircraftService.confirm(params.operatorId, aircraft.id);
      success(`${aircraft.registration} is confirmed.`);
      setIsConfirmOpen(false);
      await revalidator.revalidate();
    } catch {
      error(`Failed to confirm ${aircraft.registration}. Try again.`);
    } finally {
      setIsConfirming(false);
    }
  }

  const context: AircraftDetailsContext = {
    aircraft,
    history,
    repositions,
    operator,
    operatorId: params.operatorId,
    refresh: () => revalidator.revalidate(),
  };

  return (
    <div className="pb-8">
      <PageHeader
        crumbs={[...operatorCrumbs(operator, "fleet"), { label: aircraft.registration, mono: true }]}
        actions={
          <>
            {!aircraft.isConfirmed && (
              <Button size="xs" color="indigo" className="space-x-1.5" onClick={() => setIsConfirmOpen(true)}>
                <HiCheck />
                <span>Confirm correctness</span>
              </Button>
            )}
            <Button
              as={Link}
              to={`/operators/${params.operatorId}/aircraft/${aircraft.id}/edit`}
              viewTransition
              size="xs"
              color="alternative"
              className="space-x-1.5"
            >
              <HiPencil />
              <span>Update airframe data</span>
            </Button>
          </>
        }
      />

      <AircraftDetailsHeader aircraft={aircraft} />

      <div className="mt-4">
        <AircraftDetailsTabs operatorId={params.operatorId} aircraftId={aircraft.id} />
      </div>

      <div className="mt-3">
        <Outlet context={context} />
      </div>

      {isConfirmOpen && (
        <ConfirmAircraftModal
          aircraft={aircraft}
          operatorName={operator.shortName}
          pending={isConfirming}
          confirm={handleConfirm}
          cancel={() => setIsConfirmOpen(false)}
        />
      )}
    </div>
  );
}
