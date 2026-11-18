import { Button } from "flowbite-react";
import React from "react";
import { Link } from "react-router";
import { PageHeader } from "~/shared/ui/Shell/PageHeader";

type ActionButton = {
  text: string;
  url?: string;
  onClick?: () => void;
  color?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  viewTransition?: boolean;
};

type Props = {
  sectionTitle: string;
  primaryButton?: ActionButton;
  secondaryButton?: ActionButton;
};

const actionButtonClassName = "cursor-pointer shrink-0 whitespace-nowrap";

function ActionButton({ button }: { button: ActionButton }) {
  const content = (
    <>
      {button.icon && <span className="mr-2">{button.icon}</span>}
      {button.text}
    </>
  );

  if (button.url && !button.disabled) {
    return (
      <Button
        as={Link}
        to={button.url}
        viewTransition={button.viewTransition ?? true}
        size="xs"
        color={button.color}
        className={actionButtonClassName}
        onClick={button.onClick}
      >
        {content}
      </Button>
    );
  }

  return (
    <Button
      size="xs"
      color={button.color}
      className={actionButtonClassName}
      onClick={button.onClick}
      disabled={button.disabled}
    >
      {content}
    </Button>
  );
}

export function SectionHeaderWithButton({ sectionTitle, primaryButton, secondaryButton }: Props) {
  const hasButtons = primaryButton !== undefined || secondaryButton !== undefined;

  return (
    <PageHeader
      title={sectionTitle}
      actions={
        hasButtons && (
          <>
            {secondaryButton && <ActionButton button={secondaryButton} />}
            {primaryButton && <ActionButton button={primaryButton} />}
          </>
        )
      }
    />
  );
}
