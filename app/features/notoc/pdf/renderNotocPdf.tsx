import { pdf } from "@react-pdf/renderer";
import React from "react";
import { NotocPdf, type NotocPdfProps } from "~/features/notoc/pdf/NotocPdf";

export async function renderNotocPdf(props: NotocPdfProps): Promise<Blob> {
  return pdf(<NotocPdf {...props} />).toBlob();
}
