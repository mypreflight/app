# Design

## Shell slots

`AppLayout` owns the top bar, the bottom bar and the sidebar's foot, but parts of them belong to
the page. A `ShellSlotsProvider` holds three target elements (`ShellSlot.TopBar`,
`ShellSlot.SidebarStatus`, `ShellSlot.BottomBar`), and pages fill them with `ShellSlotPortal`, which
renders through `createPortal`. A page that renders nothing leaves the top bar with only the account
button, the sidebar's foot with only the version, and the bottom bar out of the layout (`:empty`).
The bars and the sidebar exist from `md` up; below it the phone shell (floating logo, bottom
navigation, More page) is unchanged, so the flight page keeps its inline header there, and the
flight page renders its records strip at the end of the page instead of the bottom bar. The strip uses
`useMediaQuery` rather than two copies hidden by CSS, so its document buttons keep unique ids for
the panel's focus return.

## Addresses

The route stays `track/:id/:view?/:tab?`. On the Briefing view `:tab` is now a phase slug
(`preflight`, `en-route`, `arrival`), and a document is the `document` search parameter, so a
document can be linked, and the browser's Back button closes it. Without a phase slug the briefing
shows the current phase and keeps the address short.

Old tab slugs resolve to where their content went:

| Old slug | Now |
|---|---|
| `overview`, `fuel-and-crew` | Preflight |
| `route` | En route |
| `passengers` | document `cabin` |
| `cargo` | document `cargo` |
| `progress` | document `timesheet` |
| `ofp` | document `ofp` |
| `runway-analysis` | document `runway-analysis` |
| `emergencies` | document `emergencies` |
| `delays` | document `delay` |

## Current phase

- Preflight until the flight is airborne (`InCruise`).
- En route while in cruise, until the planned top of descent: the takeoff time plus the elapsed
  time of the `(TOD)` fix, or of the first descent fix when the plan has no `(TOD)` row.
- Arrival from the top of descent, and from `TaxiingIn` on.

Without a plan or a takeoff time, cruise stays En route.

## Columns

A phase page is rows of column stacks. A stack is `flex: 1 1 22.5rem`, and the cards inside a stack
are `flex: 1 1 21.25rem` and wrap, so the same markup gives three columns on a large monitor, two
on a laptop with the last stack's cards side by side under them, and one on a phone. No breakpoint
list to maintain, and cards keep their own height.

## Documents panel

Flowbite's `Drawer` from the right, `max-w-[45rem]`, with its backdrop. It renders the existing
panels unchanged (nav log, OFP, runway analysis, NOTOC, manifest, cargo, timesheets, event
timeline, delay report, emergencies and diversions) plus the new PIL.

## Reused, split or retired

- `ParkingPositionRunwayBox` takes an optional `end` to render only departure or only arrival.
- `AirportWeatherPanel` lays its reports out by its own width (container queries) instead of the
  viewport's, so it fits a column.
- `FlightDataTabs`, `FlightDataTab` and `FlightOverviewTab` are retired. The Aircraft box leaves
  the briefing; the registration in the top bar links to the aircraft page. The Time management box
  leaves too; the sidebar clock carries Zulu time, and the local times at the two airports are not
  shown anywhere else.
- `TopBarUserTile` and `SettingsSidebarItems` are retired; the account menu replaces them.

## Records on both views

`FlightRecords` belongs to the flight page, not to the briefing: it renders the strip, the open
document's panel and the emergency and diversion forms on the Briefing and the Tracking view alike,
so the bar stays put when the pilot switches views. `useFlightDocuments` builds document addresses
for the view the pilot is on (`/track/:id/tracking?document=timesheet` over the map), and the delay
notice and the closure warning link the same way.
