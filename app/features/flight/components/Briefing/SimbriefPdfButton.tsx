import { Button, Spinner } from "flowbite-react";
import React, { useState } from "react";
import { HiOutlineDocumentDownload } from "react-icons/hi";
import { useToast } from "~/app-state/useToast";

type Props = {
  url: string;
};

const FALLBACK_FILE_NAME = "ofp.pdf";

function fileNameOf(url: string): string {
  return new URL(url).pathname.split("/").pop() || FALLBACK_FILE_NAME;
}

export function SimbriefPdfButton({ url }: Props) {
  const [pending, setPending] = useState(false);
  const { error } = useToast();

  const download = async () => {
    setPending(true);

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`SimBrief answered ${response.status}`);
      }

      const objectUrl = URL.createObjectURL(await response.blob());
      const link = window.document.createElement("a");
      link.href = objectUrl;
      link.download = fileNameOf(url);
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    } catch {
      error("The SimBrief PDF could not be downloaded. SimBrief may no longer keep it for this plan.");
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
      {pending ? "Downloading PDF" : "Download PDF"}
    </Button>
  );
}
