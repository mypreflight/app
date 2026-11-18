import { Modal, ModalBody, ModalHeader } from "flowbite-react";
import React from "react";
import { HiCheck } from "react-icons/hi";
import type { Aircraft } from "~/features/aircraft";
import { ModalActions } from "~/shared/ui/Modal/ModalActions";
import { ModalTitle } from "~/shared/ui/Modal/ModalTitle";

type Props = {
  aircraft: Aircraft;
  operatorName: string;
  pending: boolean;
  confirm: () => void;
  cancel: () => void;
};

export function ConfirmAircraftModal({ aircraft, operatorName, pending, confirm, cancel }: Props) {
  return (
    <Modal size="md" className="text-gray-800 dark:text-white" show onClose={cancel}>
      <ModalHeader>
        <ModalTitle context={aircraft.registration} action="Confirm correctness" />
      </ModalHeader>
      <ModalBody>
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
          <p>
            {aircraft.registration} was added to the fleet by a SimBrief import. Its registration and type were typed
            into SimBrief, so they may be wrong.
          </p>
          <p>
            Confirm only if {aircraft.registration} is a real {aircraft.airframe.name} of {operatorName}. Fix anything
            wrong with Update airframe data first.
          </p>
        </div>
      </ModalBody>
      <ModalActions
        cancel={{ onClick: cancel }}
        confirm={{ label: "Confirm aircraft", icon: HiCheck, onClick: confirm }}
        pending={pending}
        pendingLabel="Confirming"
      />
    </Modal>
  );
}
