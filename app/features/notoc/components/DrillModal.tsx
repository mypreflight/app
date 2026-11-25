import { Modal, ModalBody, ModalHeader } from "flowbite-react";
import React from "react";
import { DrillCard } from "~/features/notoc/components/DrillCard";
import type { NotocDrill } from "~/features/notoc/model";
import { ModalTitle } from "~/shared/ui/Modal/ModalTitle";

type Props = {
  drill: NotocDrill;
  subject: string;
  close: () => void;
};

export function DrillModal({ drill, subject, close }: Props) {
  return (
    <Modal size="md" show onClose={close} dismissible>
      <ModalHeader>
        <ModalTitle context="Emergency response drill" action={subject} />
      </ModalHeader>
      <ModalBody>
        <DrillCard drill={drill} />
      </ModalBody>
    </Modal>
  );
}
