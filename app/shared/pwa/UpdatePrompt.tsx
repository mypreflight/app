import { useRegisterSW } from "virtual:pwa-register/react";
import { useEffect } from "react";
import { useInstalledApp } from "~/shared/hooks/useInstalledApp";
import { UpdateNotice } from "./UpdateNotice";

const updateCheckIntervalMs = 60_000;

async function isNewWorkerReachable(swUrl: string): Promise<boolean> {
  if (!navigator.onLine) {
    return false;
  }

  try {
    const response = await fetch(swUrl, { cache: "no-store" });
    return response.status === 200;
  } catch {
    return false;
  }
}

function scheduleUpdateChecks(swUrl: string, registration: ServiceWorkerRegistration | undefined) {
  if (!registration) {
    return;
  }

  setInterval(async () => {
    if (await isNewWorkerReachable(swUrl)) {
      await registration.update();
    }
  }, updateCheckIntervalMs);
}

function applyUpdateOnceHidden(applyUpdate: () => void): (() => void) | undefined {
  if (document.visibilityState === "hidden") {
    applyUpdate();
    return undefined;
  }

  function applyIfHidden() {
    if (document.visibilityState === "hidden") {
      applyUpdate();
    }
  }

  document.addEventListener("visibilitychange", applyIfHidden);

  return () => document.removeEventListener("visibilitychange", applyIfHidden);
}

export function UpdatePrompt() {
  const isInstalledApp = useInstalledApp();
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({ onRegisteredSW: scheduleUpdateChecks });

  useEffect(() => {
    if (!needRefresh) {
      return;
    }

    if (isInstalledApp) {
      return;
    }

    return applyUpdateOnceHidden(() => updateServiceWorker(true));
  }, [needRefresh, isInstalledApp, updateServiceWorker]);

  if (!needRefresh || !isInstalledApp) {
    return null;
  }

  return <UpdateNotice onReload={() => updateServiceWorker(true)} />;
}
