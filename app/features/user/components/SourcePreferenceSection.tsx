import { Button } from "flowbite-react";
import { useState } from "react";
import { FaCircleCheck } from "react-icons/fa6";
import { useAuth } from "~/app-state/useAuth";
import { ChangeSourcePreferenceModal } from "~/features/user/components/ChangeSourcePreferenceModal";
import { SOURCE_PREFERENCES, type SourcePreference, sourceOption } from "~/features/user/lib/sourcePreferences";
import { RecordNote } from "~/shared/ui/Record/RecordNote";
import { RecordRow } from "~/shared/ui/Record/RecordRow";

type Props = {
  preference: SourcePreference;
};

export function SourcePreferenceSection({ preference }: Props) {
  const { user } = useAuth();
  const [wasChanged, setWasChanged] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const copy = SOURCE_PREFERENCES[preference];

  if (user === null) {
    return null;
  }

  const current = copy.current(user);
  const { icon: Icon, label } = sourceOption(copy, current);

  function closeModal() {
    setIsModalOpen(false);
  }

  return (
    <RecordRow
      label={copy.label}
      action={
        <Button
          color="light"
          size="sm"
          className="min-h-10 w-full sm:w-auto"
          aria-label={copy.changeLabel}
          onClick={() => setIsModalOpen(true)}
        >
          Change source
        </Button>
      }
    >
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
        <span className="inline-flex items-center gap-1">
          <Icon aria-hidden className="size-3.5 shrink-0" />
          {label}
        </span>
      </p>

      {wasChanged ? (
        <p role="status" className="flex items-start gap-2 text-sm text-green-700 dark:text-green-400">
          <FaCircleCheck aria-hidden className="mt-0.5 shrink-0" />
          <span>{copy.changed}</span>
        </p>
      ) : (
        <RecordNote>{copy.explanation}</RecordNote>
      )}

      {isModalOpen && (
        <ChangeSourcePreferenceModal
          preference={preference}
          current={current}
          close={closeModal}
          onChanged={() => {
            setWasChanged(true);
            closeModal();
          }}
        />
      )}
    </RecordRow>
  );
}
