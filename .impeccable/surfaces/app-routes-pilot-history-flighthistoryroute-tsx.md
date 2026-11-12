---
version: 1
slug: "app-routes-pilot-history-flighthistoryroute-tsx"
primary_target: "app/routes/pilot/history/FlightHistoryRoute.tsx"
related_targets: ["app/routes/pilot/history/FlightHistoryListRoute.tsx"]
---

# Flight history

Scope: `/flight-history` (list) and `/flight-history/:id/:view?/:tab?` (a closed flight). Mode: Operate.

Audience and job: Cabin crew reopening a flight they flew. First where it flew (the flown ADS-B track over the filed route), then the documents it was flown on (route and nav log, fuel and loadsheet, manifests, OFP, runway analysis) and the records (events, delay report). The page must read as a past flight at a glance (user requirement): breadcrumb `Flight history › <flight>`, "Flown <date>" and the Closed badge open the header.

Constraints: the seeded finished flights are manual with 4-point tracks and no filed route, so every element has to read with sparse data and no route. No editing on a closed flight.

## Direction contract

THESIS: A closed flight is the Tracking screen frozen at on-block, not a report page. It refuses the hero banner plus overview tab where the map sits fourth in a tab row.

OWN-WORLD: MyPreflight's existing system unchanged: Paper cards on the map, Hairline edges, Roboto Mono figures, one Signal Indigo for the view switch and the hovered fix, the flown track in indigo over the dashed great circle and the filed route.

STORY: The pilot sees the whole flight drawn, reads each block event against schedule, scrubs the profile to see where and how high the aircraft was at any minute, and opens Documents to check what was planned.

FIRST VIEWPORT: Full-bleed map in the content panel. Top: header card (breadcrumb with Flown date and Closed badge; identity, route with block time, History / Documents switch, arrival punctuality), then the record card (block events vs schedule, block and air time, fuel burned vs planned trip). Bottom: a floating profile strip (altitude and ground speed over UTC, taxi out and taxi in shaded) beside Map options. Fix card at the right when a fix is clicked.

FORM: Tracking, frozen at on-block; second of my ordered list (dealt), chosen by the user. seed:f65ac558c0d8f071

Signature: the profile's cursor drives the aircraft along the flown track on both renderers.

List: the records table stays; from 1024px a preview pane follows the hovered or focused row with the globe, block events and fuel.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
