import { Modal, ModalBody, ModalHeader, Radio } from "flowbite-react";
import { useState } from "react";
import { FaCircleExclamation } from "react-icons/fa6";
import { useAuth } from "~/app-state/useAuth";
import { SOURCE_PREFERENCES, type SourcePreference } from "~/features/user/lib/sourcePreferences";
import { useApi } from "~/shared/api/useApi";
import { ModalActions } from "~/shared/ui/Modal/ModalActions";
import { ModalTitle } from "~/shared/ui/Modal/ModalTitle";

type Props = {
  preference: SourcePreference;
  current: string;
  close: () => void;
  onChanged: () => void;
};

export function ChangeSourcePreferenceModal({ preference, current, close, onChanged }: Props) {
  const { refreshUser } = useAuth();
  const { userService } = useApi();
  const [selected, setSelected] = useState(current);
  const [isSaving, setIsSaving] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  const copy = SOURCE_PREFERENCES[preference];

  async function save() {
    setIsSaving(true);
    setHasFailed(false);

    try {
      await userService.updateOwnProfile({ [preference]: selected });
      await refreshUser();
    } catch {
      setHasFailed(true);
      setIsSaving(false);
      return;
    }

    onChanged();
  }

  return (
    <Modal size="md" className="text-gray-800 dark:text-white" show onClose={close}>
      <ModalHeader>
        <ModalTitle context={copy.context} action="Change" />
      </ModalHeader>
      <ModalBody className="text-gray-900 dark:text-gray-100">
        <p className="mb-4 text-pretty text-sm text-gray-600 dark:text-gray-400">{copy.intro}</p>

        <fieldset aria-label={copy.label} className="space-y-3">
          {copy.options.map(({ value: source, label, icon: Icon, description }) => {
            const radioId = `${preference}-${source}`;

            return (
              <label
                key={source}
                htmlFor={radioId}
                className="flex select-none items-start gap-3 rounded-lg p-3 py-1.5 text-start hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Radio
                  id={radioId}
                  name={preference}
                  value={source}
                  checked={selected === source}
                  disabled={isSaving}
                  onChange={() => setSelected(source)}
                  aria-labelledby={`${radioId}-label`}
                  aria-describedby={`${radioId}-description`}
                  className="mt-1.5 cursor-pointer"
                />
                <span className="flex-1">
                  <span
                    id={`${radioId}-label`}
                    className="cursor-pointer text-sm font-medium text-gray-900 dark:text-gray-100"
                  >
                    <span className="inline-flex items-center gap-1">
                      <Icon aria-hidden className="size-3.5 shrink-0" />
                      {label}
                    </span>
                  </span>
                  <span id={`${radioId}-description`} className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                    {description}
                  </span>
                </span>
              </label>
            );
          })}
        </fieldset>

        {hasFailed && (
          <p
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-pretty text-sm text-red-700 dark:border-red-900 dark:bg-red-900/40 dark:text-red-300"
          >
            <FaCircleExclamation aria-hidden className="mt-0.5 shrink-0" />
            <span>{copy.failure}</span>
          </p>
        )}
      </ModalBody>
      <ModalActions
        cancel={{ onClick: close }}
        confirm={{ label: "Save changes", onClick: save, disabled: selected === current }}
        pending={isSaving}
        pendingLabel="Saving…"
      />
    </Modal>
  );
}
