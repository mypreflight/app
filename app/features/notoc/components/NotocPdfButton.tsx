import { Button, Spinner } from "flowbite-react";
import React, { useState } from "react";
import { HiOutlineDocumentDownload } from "react-icons/hi";
import { useToast } from "~/app-state/useToast";
import type { NotocPdfProps } from "~/features/notoc/pdf/NotocPdf";

type Props = {
  document: NotocPdfProps;
  fileName: string;
};

export function NotocPdfButton({ document: pdfDocument, fileName }: Props) {
  const [pending, setPending] = useState(false);
  const { error } = useToast();

  const download = async () => {
    setPending(true);

    try {
      const { renderNotocPdf } = await import("~/features/notoc/pdf/renderNotocPdf");
      const url = URL.createObjectURL(await renderNotocPdf(pdfDocument));
      const link = window.document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      error("The NOTOC PDF could not be prepared. Try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <Button color="alternative" size="xs" onClick={download} disabled={pending}>
      {pending ? (
        <Spinner size="xs" className="me-1.5" />
      ) : (
        <HiOutlineDocumentDownload className="me-1.5 size-4" aria-hidden={true} />
      )}
      {pending ? "Preparing PDF" : "Download PDF"}
    </Button>
  );
}
