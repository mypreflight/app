# Briefing phase layout

## Why

The Briefing view of a flight is ten tabs wide: Overview, Fuel & crew, Passengers, Cargo, Flight
progress, Route, OFP, Runway analysis, Alternates/Emergencies & diversions, Delay report. Pilots
get lost in it. Nothing tells them which tab matters now, the same airport appears in three tabs,
and the things a crew reads in the order the flight happens (departure, the crossing, the arrival)
are spread by data type instead.

The Tracking view is liked because it is plain. The Briefing view should read the same way: one
short page for the part of the flight the crew is in, with the long documents one click away.

The app shell around every page also wastes height: the flight's identity row sits inside the
outlet as a full card, the AOC and ADS-B readings sit inside it too, and the account tile and theme
switch take the bottom of the sidebar.

## What Changes

- **App shell (from `md`).** A top bar above the outlet carries the page's own context on the left
  and a round account button with the user's initials on the right; its menu holds the name, the
  email, Settings, the Discord community, a Light, Dark and Auto theme switch, and Sign out. A
  bottom bar below the outlet belongs to the page and takes no room while empty. The sidebar loses
  the account tile and the "Your account" section and ends in the page's readings (on a flight
  page, AOC and ADS-B), the app version and a What's new link.
- **Flight top bar.** On a flight page the identity row moves into the top bar as one line: fin,
  flight number, airport pair, cities with block time, registration and airframe, and a smaller
  Briefing/Tracking switch. Below `md` the page keeps today's header.
- **Phase tabs.** The ten briefing tabs become three phases: Preflight, the crossing (named
  "Oceanic" when the plan has an oceanic track, "En route" otherwise) and Arrival. The briefing
  opens on the phase the flight is in and marks finished phases as done.
- **Phase pages.** Each phase arranges the existing cards in up to three columns that follow the
  width: weather, runway and stand, fuel and load, passengers and crew before departure; the
  oceanic clearance data, NAT track, ETOPS and fix fuel reports for the crossing; destination
  weather, arrival runway and stand and alternates for the arrival.
- **Documents.** A button row beside the phase heading opens Nav log, OFP, Runway analysis, NOTOC
  and the new PIL in a panel that slides in from the right. A strip in the bottom bar, on both the
  Briefing and the Tracking view, opens Cabin and manifest, Cargo, Timesheet, Activity log and Delay
  report the same way, over the view the pilot is on, and holds the Declare emergency and Report
  diversion buttons. Below `md` the strip ends the page.
- **PIL.** A passenger information list: the passengers with a special service request, filterable
  by request code, each code spelled out.
- Old briefing tab addresses keep working and land on the phase or document that now holds them.

## Non-goals

- No oceanic clearance request flow. The prototype showed one; the API has no clearance resource.
  It is a separate API change, proposed separately.
- No new API call except reading a destination's weather on the flight page, which the airport
  library already does.
- No change to the phase card, the Tracking view's map, flight history or the mobile shell
  (bottom navigation and the More page).
