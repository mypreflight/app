import { Modal, ModalBody, ModalHeader, Spinner } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { FaCircleExclamation, FaFileImport } from "react-icons/fa6";
import type { Flight } from "~/features/flight";
import { describeSimbriefImportFailure } from "~/features/flight/lib/describeSimbriefImportFailure";
import type { SimbriefFlight } from "~/features/user";
import { SimbriefPlanSummary } from "~/features/user/components/SimbriefPlanSummary";
import { useApi } from "~/shared/api/useApi";
import { ModalActions } from "~/shared/ui/Modal/ModalActions";
import { ModalTitle } from "~/shared/ui/Modal/ModalTitle";

type Props = {
  simbriefUserId: string;
  imported: (flight: Flight) => Promise<void> | void;
  close: () => void;
};

type LatestPlan = { status: "loading" } | { status: "ready"; plan: SimbriefFlight } | { status: "failed" };

function FailureAlert({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="alert"
      className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-pretty text-sm text-red-700 dark:border-red-900 dark:bg-red-900/40 dark:text-red-300"
    >
      <FaCircleExclamation aria-hidden className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

export function ImportSimbriefFlightModal({ simbriefUserId, imported, close }: Props) {
  const { userService, flightService } = useApi();
  const [latest, setLatest] = useState<LatestPlan>({ status: "loading" });
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    userService
      .verifySimbriefUser(simbriefUserId)
      .then((account) => {
        if (active) setLatest({ status: "ready", plan: account.latestFlight });
      })
      .catch(() => {
        if (active) setLatest({ status: "failed" });
      });

    return () => {
      active = false;
    };
  }, [userService, simbriefUserId]);

  const importPlan = async () => {
    setPending(true);
    setFailure(null);

    try {
      const flight = await flightService.importFlightFromSimbrief();
      await imported(flight);
    } catch (reason) {
      setFailure(describeSimbriefImportFailure(reason));
      setPending(false);
    }
  };

  return (
    <Modal size="md" className="text-gray-800 dark:text-white" show onClose={pending ? undefined : close}>
      <ModalHeader>
        <ModalTitle
          context="SimBrief import"
          action={latest.status === "ready" ? latest.plan.callsign : "Latest plan"}
        />
      </ModalHeader>
      <ModalBody>
        {latest.status === "loading" && (
          <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Spinner size="sm" aria-hidden={true} />
            Loading your latest plan…
          </p>
        )}
        {latest.status === "ready" && <SimbriefPlanSummary plan={latest.plan} showCallsign={false} />}
        {latest.status === "failed" && (
          <p className="text-pretty text-sm text-gray-600 dark:text-gray-400">
            Your latest plan couldn’t be previewed. You can still import it.
          </p>
        )}

        <p className="mt-4 text-pretty text-sm text-gray-600 dark:text-gray-400">
          You’ll be checked in with the plan’s estimated times.
        </p>

        {failure !== null && <FailureAlert>{failure}</FailureAlert>}
      </ModalBody>
      <ModalActions
        cancel={{ onClick: close }}
        confirm={{ label: "Import and check in", icon: FaFileImport, onClick: importPlan }}
        pending={pending}
        pendingLabel="Importing…"
      />
    </Modal>
  );
}
