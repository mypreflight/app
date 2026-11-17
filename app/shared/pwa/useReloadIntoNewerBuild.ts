import { useEffect, useState } from "react";

const skipWaitingMessage = { type: "SKIP_WAITING" };
const checkTimeoutMs = 5_000;

function canHoldNewerBuild(): boolean {
  return "serviceWorker" in navigator && navigator.serviceWorker.controller !== null;
}

function waitUntilInstalled(worker: ServiceWorker): Promise<ServiceWorker | null> {
  return new Promise((resolve) => {
    function settle() {
      if (worker.state === "installed") {
        resolve(worker);
      } else if (worker.state !== "installing" && worker.state !== "parsed") {
        resolve(null);
      }
    }

    worker.addEventListener("statechange", settle);
    settle();
  });
}

async function findNewerBuild(): Promise<ServiceWorker | null> {
  const registration = await navigator.serviceWorker.getRegistration();

  if (!registration) {
    return null;
  }

  if (!registration.waiting && !registration.installing) {
    await registration.update();
  }

  if (registration.waiting) {
    return registration.waiting;
  }

  return registration.installing ? waitUntilInstalled(registration.installing) : null;
}

function switchTo(worker: ServiceWorker) {
  navigator.serviceWorker.addEventListener("controllerchange", () => window.location.reload(), { once: true });
  worker.postMessage(skipWaitingMessage);
}

export function useReloadIntoNewerBuild(): boolean {
  const [checking, setChecking] = useState<boolean>(canHoldNewerBuild);

  useEffect(() => {
    if (!canHoldNewerBuild()) {
      return;
    }

    let left = false;
    const stopChecking = () => setChecking(false);
    const timeout = window.setTimeout(stopChecking, checkTimeoutMs);

    findNewerBuild()
      .then((worker) => {
        if (left) {
          return;
        }

        if (worker === null) {
          stopChecking();
          return;
        }

        switchTo(worker);
      })
      .catch(stopChecking);

    return () => {
      left = true;
      window.clearTimeout(timeout);
    };
  }, []);

  return checking;
}
