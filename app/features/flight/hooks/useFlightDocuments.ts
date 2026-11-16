import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router";
import type { BriefingDocumentEntry } from "~/features/flight/components/Briefing/BriefingDocumentLink";
import { useTrackedFlight } from "~/features/flight/hooks/useTrackedFlight";
import type { TrackingViewState } from "~/features/flight/hooks/useTrackingView";
import { BriefingDocument } from "~/features/flight/lib/briefingPhase";
import { findSpecialServiceRequest } from "~/features/flight/lib/passengerInformation";
import { trackFlightPath } from "~/features/flight/lib/trackingView";
import type { SpecialServiceRequest } from "~/features/flight/model";

const REQUEST_PARAM = "request";

export type FlightDocuments = {
  documentHref: (document: BriefingDocument, request?: SpecialServiceRequest | null) => string;
  entry: (document: BriefingDocument, label: string, unavailableReason?: string) => BriefingDocumentEntry;
  closeDocument: () => void;
  pilRequest: SpecialServiceRequest | null;
  changePilRequest: (request: SpecialServiceRequest | null) => void;
};

export function useFlightDocuments({ view, phase }: TrackingViewState): FlightDocuments {
  const { flight } = useTrackedFlight();
  const navigate = useNavigate();
  const location = useLocation();

  const flightId = flight?.id ?? "";
  const openedHere = (location.state as { openedFromBriefing?: boolean } | null)?.openedFromBriefing === true;

  const documentHref = useCallback(
    (document: BriefingDocument, request: SpecialServiceRequest | null = null) => {
      const path = trackFlightPath(flightId, view, phase, document);

      return request === null ? path : `${path}&${REQUEST_PARAM}=${request}`;
    },
    [flightId, view, phase],
  );

  const entry = useCallback(
    (document: BriefingDocument, label: string, unavailableReason?: string): BriefingDocumentEntry => ({
      document,
      label,
      href: unavailableReason === undefined ? documentHref(document) : null,
      unavailableReason,
    }),
    [documentHref],
  );

  const closeDocument = useCallback(() => {
    if (openedHere) {
      navigate(-1);
      return;
    }

    navigate(trackFlightPath(flightId, view, phase), { replace: true });
  }, [openedHere, navigate, flightId, view, phase]);

  const changePilRequest = useCallback(
    (request: SpecialServiceRequest | null) =>
      navigate(documentHref(BriefingDocument.Pil, request), { replace: true, state: location.state }),
    [navigate, documentHref, location.state],
  );

  return {
    documentHref,
    entry,
    closeDocument,
    pilRequest: findSpecialServiceRequest(new URLSearchParams(location.search).get(REQUEST_PARAM)),
    changePilRequest,
  };
}
