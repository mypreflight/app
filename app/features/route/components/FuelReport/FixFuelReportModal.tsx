import { Modal, ModalBody, ModalHeader } from "flowbite-react";
import { Formik, Form as FormikForm, type FormikHelpers } from "formik";
import React, { useRef } from "react";
import { useToast } from "~/app-state/useToast";
import { FIXED_FIGURE, FIXED_SUFFIX } from "~/features/route/components/Chart/FixFigure";
import { fixName } from "~/features/route/lib/fixName";
import { formatTonnesFromKilograms } from "~/features/route/lib/routeFigures";
import type { PlannedRouteFix, PlannedRouteFuelReport, ReportFixFuel } from "~/features/route/model";
import { fixFuelReportSchema } from "~/features/route/schema";
import { handleFormikApiError } from "~/shared/lib/handleFormikApiError";
import { dateToIcaoTime } from "~/shared/ui/Date/FormattedIcaoTime";
import { FocusFirstError } from "~/shared/ui/Form/FocusFirstError";
import { FormDensityProvider } from "~/shared/ui/Form/formDensity";
import { ManagedFloatingInputBlock } from "~/shared/ui/Form/Managed/ManagedFloatingInputBlock";
import { ModalActions } from "~/shared/ui/Modal/ModalActions";
import { ModalTitle } from "~/shared/ui/Modal/ModalTitle";

type FormData = {
  actualOnBoard: number | "";
  reportedAt: string;
};

type Props = {
  fix: PlannedRouteFix;
  takeoffTime: Date | null;
  onReport: ReportFixFuel;
  close: () => void;
};

function initialValues(report: PlannedRouteFuelReport | null): FormData {
  if (report === null) {
    return { actualOnBoard: "", reportedAt: dateToIcaoTime(new Date()) };
  }

  return { actualOnBoard: report.actualOnBoard / 1000, reportedAt: dateToIcaoTime(new Date(report.reportedAt)) };
}

export function FixFuelReportModal({ fix, takeoffTime, onReport, close }: Props) {
  const { error } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const plannedOnBoard = fix.fuel.plannedOnBoard;
  const schema = fixFuelReportSchema(takeoffTime);

  const handleSubmit = async (values: FormData, { setErrors, setSubmitting }: FormikHelpers<FormData>) => {
    const { actualOnBoard, reportedAt } = schema.cast(values);

    try {
      await onReport(fix.ordinal, { actualOnBoard: Math.round(actualOnBoard * 1000), reportedAt });
      close();
    } catch (err) {
      handleFormikApiError<FormData>(err, setErrors, error, "Failed to save the actual fuel. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal size="sm" show onClose={close} initialFocus={inputRef}>
      <ModalHeader>
        <ModalTitle context="Fuel Report" action={`${fixName(fix.ident)} fix`} />
      </ModalHeader>
      <Formik<FormData> initialValues={initialValues(fix.fuelReport)} validationSchema={schema} onSubmit={handleSubmit}>
        {({ isSubmitting }) => (
          <FormikForm noValidate className="flex min-h-0 flex-1 flex-col">
            <FocusFirstError />
            <ModalBody>
              <FormDensityProvider density="compact">
                <div className="flex items-start gap-3">
                  <ManagedFloatingInputBlock
                    field="actualOnBoard"
                    label="Fuel on board"
                    type="number"
                    autoComplete="off"
                    unit="t"
                    required={false}
                    inputRef={inputRef}
                    className="min-w-0 flex-1"
                    description={
                      plannedOnBoard !== null && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Flight plan EFOB{" "}
                          <span className={FIXED_FIGURE}>
                            {formatTonnesFromKilograms(plannedOnBoard)}
                            <span className={FIXED_SUFFIX}>t</span>
                          </span>
                        </p>
                      )
                    }
                  />
                  <ManagedFloatingInputBlock
                    field="reportedAt"
                    label="Time"
                    inputMode="numeric"
                    autoComplete="off"
                    unit="Z"
                    required={false}
                    className="w-28 shrink-0 [&_input]:font-mono [&_input]:tabular-nums"
                  />
                </div>
              </FormDensityProvider>
            </ModalBody>
            <ModalActions
              cancel={{ onClick: close }}
              confirm={{ label: "Save", type: "submit" }}
              pending={isSubmitting}
              pendingLabel="Saving…"
            />
          </FormikForm>
        )}
      </Formik>
    </Modal>
  );
}
