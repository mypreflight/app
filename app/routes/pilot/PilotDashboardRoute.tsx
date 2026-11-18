import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "~/app-state/useAuth";
import { useToast } from "~/app-state/useToast";
import type { Flight } from "~/features/flight";
import { CurrentFlightBox } from "~/features/flight/components/Dashboard/Main/Box/CurrentFlightBox";
import { CurrentFlightUnavailableBox } from "~/features/flight/components/Dashboard/Main/Box/CurrentFlightUnavailableBox";
import { DebugFlightListBox } from "~/features/flight/components/Dashboard/Main/Box/DebugFlightListBox";
import { CurrentFlightBoxLoader } from "~/features/flight/components/Dashboard/Main/Box/Loader/CurrentFlightBoxLoader";
import { NextScheduledFlightBoxLoader } from "~/features/flight/components/Dashboard/Main/Box/Loader/NextScheduledFlightBoxLoader";
import { RecentFlightsBoxLoader } from "~/features/flight/components/Dashboard/Main/Box/Loader/RecentFlightsBoxLoader";
import { NextScheduledFlightBox } from "~/features/flight/components/Dashboard/Main/Box/NextScheduledFlightBox";
import { NoCurrentFlightBox } from "~/features/flight/components/Dashboard/Main/Box/NoCurrentFlightBox";
import { RecentFlightsBox } from "~/features/flight/components/Dashboard/Main/Box/RecentFlightsBox";
import { UserHeader } from "~/features/flight/components/Dashboard/Main/UserHeader";
import { ImportSimbriefFlightModal } from "~/features/flight/components/Modal/ImportSimbriefFlightModal";
import { useCurrentFlight } from "~/features/flight/hooks/useCurrentFlight";
import { useFlightNumber } from "~/features/flight/hooks/useFlightNumber";
import { useGroundStop } from "~/features/flight/hooks/useGroundStop";
import { useNextScheduledFlight } from "~/features/flight/hooks/useNextScheduledFlight";
import { useRecentFlights } from "~/features/flight/hooks/useRecentFlights";
import { PostcardsBox } from "~/features/postcard/components/Dashboard/PostcardsBox";
import { CurrentRotationBox } from "~/features/rotation/components/CurrentRotationBox";
import { CurrentRotationBoxLoader } from "~/features/rotation/components/CurrentRotationBoxLoader";
import { useCurrentRotation } from "~/features/rotation/hooks/useCurrentRotation";
import { RecentActivityBox } from "~/features/stats/components/Dashboard/RecentActivityBox";
import { CurrentLocationBox } from "~/features/travel/components/CurrentLocationBox";
import { CurrentLocationBoxLoader } from "~/features/travel/components/CurrentLocationBoxLoader";
import { ChangeSimbriefIdModal } from "~/features/user/components/ChangeSimbriefIdModal";
import { useUserTravels } from "~/features/user/hooks/useUserTravels";
import { useAppEnvironment } from "~/shared/hooks/useAppEnvironment";
import { usePageTitle } from "~/shared/hooks/usePageTitle";

export default function PilotDashboardRoute() {
  const { user } = useAuth();
  const { isDebug } = useAppEnvironment();
  const currentFlightId = user?.currentFlightId ?? null;
  const { recentFlights, lastFlight, loading: loadingLast, failed: failedLast } = useRecentFlights();
  const {
    currentFlight,
    loading: loadingCurrent,
    failed: failedCurrent,
    refresh: refreshCurrentFlight,
  } = useCurrentFlight();
  const {
    currentLocation,
    latestTravel,
    loading: loadingTravels,
    failed: failedTravels,
    refresh: refreshTravels,
  } = useUserTravels();
  const { rotation, active: activeRotations, loading: loadingRotation } = useCurrentRotation();
  const {
    nextFlight,
    loading: loadingNext,
    failed: failedNext,
  } = useNextScheduledFlight(activeRotations, loadingRotation, currentFlightId);
  const navigate = useNavigate();
  const { success } = useToast();
  const [simbriefModal, setSimbriefModal] = useState<"connect" | "import" | null>(null);
  usePageTitle("Dashboard");

  const simbriefUserId = user?.simbriefUserId ?? null;
  const simbriefImport =
    currentFlightId === null
      ? {
          hasSimbriefId: simbriefUserId !== null,
          open: () => setSimbriefModal(simbriefUserId === null ? "connect" : "import"),
        }
      : null;

  const handleImported = async (flight: Flight) => {
    await refreshCurrentFlight();
    success(`${flight.flightNumber} imported. You’re checked in.`);
    navigate(`/track/${flight.id}`, { viewTransition: true });
  };

  const showLocation = !loadingCurrent && !currentFlight && !failedCurrent;
  const travelFlightNumber = useFlightNumber(showLocation ? (latestTravel?.flightId ?? null) : null);
  const { groundStop, loading: loadingGround } = useGroundStop(
    showLocation && !loadingLast ? currentLocation : null,
    latestTravel,
    lastFlight,
  );
  const settlingCurrentFlight =
    loadingCurrent || (showLocation && (loadingLast || loadingTravels || loadingGround || loadingNext));
  const nothingFlownYet = !loadingLast && !failedLast && recentFlights.length === 0;

  const recentFlightsBox = loadingLast ? (
    <RecentFlightsBoxLoader />
  ) : (
    <RecentFlightsBox flights={recentFlights} failed={failedLast} />
  );
  const nextScheduledFlightBox =
    loadingNext || settlingCurrentFlight ? (
      <NextScheduledFlightBoxLoader />
    ) : (
      <NextScheduledFlightBox
        flight={nextFlight}
        failed={failedNext}
        departure={currentFlight?.destinationAirport ?? groundStop?.airport ?? null}
        simbriefImport={simbriefImport}
      />
    );

  return (
    <>
      <UserHeader />
      <div className="grid grid-cols-1 gap-3 pt-6 md:pt-0 lg:grid-cols-2 xl:grid-cols-3">
        <div className="flex flex-col gap-3 xl:col-span-2">
          {settlingCurrentFlight ? (
            <CurrentFlightBoxLoader expectsFlight={currentFlightId !== null} />
          ) : currentFlight ? (
            <CurrentFlightBox flight={currentFlight} />
          ) : failedCurrent ? (
            <CurrentFlightUnavailableBox />
          ) : (
            <NoCurrentFlightBox groundStop={groundStop} nextFlight={nextFlight} nextFlightFailed={failedNext} />
          )}
          {nothingFlownYet ? (
            nextScheduledFlightBox
          ) : (
            <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2">
              {recentFlightsBox}
              {nextScheduledFlightBox}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3">
          {loadingRotation ? <CurrentRotationBoxLoader /> : rotation && <CurrentRotationBox rotation={rotation} />}
          {showLocation &&
            (loadingTravels ? (
              <CurrentLocationBoxLoader />
            ) : (
              <CurrentLocationBox
                currentLocation={currentLocation}
                latestTravel={latestTravel}
                flightNumber={travelFlightNumber}
                failed={failedTravels}
                onTravelCreated={refreshTravels}
              />
            ))}
          <PostcardsBox />
          <RecentActivityBox />
        </div>
      </div>
      {isDebug && (
        <div className="pt-4">
          <DebugFlightListBox />
        </div>
      )}
      {simbriefModal === "connect" && (
        <ChangeSimbriefIdModal
          current={null}
          close={() => setSimbriefModal(null)}
          onSaved={(saved) => setSimbriefModal(saved === null ? null : "import")}
        />
      )}
      {simbriefModal === "import" && simbriefUserId !== null && (
        <ImportSimbriefFlightModal
          simbriefUserId={simbriefUserId}
          imported={handleImported}
          close={() => setSimbriefModal(null)}
        />
      )}
    </>
  );
}
