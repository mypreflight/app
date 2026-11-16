import React, { type ComponentProps, Suspense } from "react";
import type { GlobeMap } from "~/shared/ui/Globe/GlobeMap";

const GlobeMapChunk = React.lazy(() =>
  import("~/shared/ui/Globe/GlobeMap").then((module) => ({
    default: module.GlobeMap,
  })),
);

export function LazyGlobeMap(props: ComponentProps<typeof GlobeMap>) {
  return (
    <Suspense fallback={<div className="h-full w-full animate-pulse bg-gray-100 dark:bg-gray-900" />}>
      <GlobeMapChunk {...props} />
    </Suspense>
  );
}
