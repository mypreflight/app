import type { Decorator } from "@storybook/react-vite";
import React from "react";
import { type ApiServices, UseApi } from "~/shared/api/useApi";

export type ServiceStubs = { [Service in keyof ApiServices]?: Partial<ApiServices[Service]> };

const notServed = () => Promise.reject(new Error("This story does not serve that request."));

function stubbedService(methods: Record<PropertyKey, unknown>): unknown {
  return new Proxy(methods, {
    get: (target, method) => (method in target ? target[method] : notServed),
  });
}

function stubbedServices(stubs: ServiceStubs): ApiServices {
  const services = new Map<PropertyKey, unknown>();

  return new Proxy({} as ApiServices, {
    get: (_, service) => {
      if (!services.has(service)) {
        const methods = (stubs[service as keyof ApiServices] ?? {}) as Record<PropertyKey, unknown>;
        services.set(service, stubbedService({ ...methods }));
      }

      return services.get(service);
    },
  });
}

export function withApi(stubs: ServiceStubs): Decorator {
  const services = stubbedServices(stubs);

  return (Story) => (
    <UseApi.Provider value={services}>
      <Story />
    </UseApi.Provider>
  );
}
