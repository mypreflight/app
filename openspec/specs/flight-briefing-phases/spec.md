# flight-briefing-phases Specification

## Purpose
Lets a crew read the briefing in the order the flight happens, on one short page for the part of
the flight they are in, with the long documents one click away instead of ten tabs.

## Requirements

### Requirement: The briefing opens on the current phase

The Briefing view SHALL show three phase tabs, Preflight, the crossing and Arrival, and SHALL open
on the phase the flight is in when its address names no phase. A phase before the current one SHALL
be marked done and the current one SHALL be marked now.

#### Scenario: Crew opens the briefing after check-in

- **WHEN** a checked-in flight's briefing opens at `/track/:id/briefing`
- **THEN** the Preflight tab is selected and marked now

#### Scenario: Crew opens the briefing in cruise

- **WHEN** the flight is in cruise before its planned top of descent
- **THEN** the crossing tab is selected and marked now, and Preflight is marked done

#### Scenario: Crew opens the briefing after top of descent

- **WHEN** the flight is in cruise after its planned top of descent, or taxiing in
- **THEN** the Arrival tab is selected and marked now

### Requirement: The crossing tab is named after the route

The middle tab SHALL read "Oceanic" when the planned route flies an oceanic track or track geometry,
and "En route" otherwise.

#### Scenario: Route without a track

- **WHEN** the plan's oceanic routing is random or the flight has no plan
- **THEN** the middle tab reads "En route"

### Requirement: Documents open in a side panel

The briefing SHALL offer Nav log, OFP, Runway analysis, NOTOC and PIL as buttons beside the phase
heading, and Cabin and manifest, Cargo, Timesheet, Activity log and Delay report in a strip in the
bottom bar, or at the end of the page below the `md` breakpoint. The strip, with Declare emergency
and Report diversion, SHALL show on the Tracking view as well, where its documents open over the
map without leaving the view. Each SHALL open in a panel from the right, addressed by the `document` search
parameter, and closing the panel SHALL return focus to the button that opened it.

#### Scenario: Pilot opens the nav log

- **WHEN** the pilot selects Nav log
- **THEN** the panel opens with the nav log and the address gains `?document=nav-log`

#### Scenario: Pilot opens the timesheet from the map

- **WHEN** the pilot is on the Tracking view and selects Timesheet in the bottom bar
- **THEN** the panel opens over the map and the address becomes `/track/:id/tracking?document=timesheet`

### Requirement: The PIL lists special service requests

The PIL SHALL list every passenger with a special service request, with seat, name, cabin, the
request code and its meaning, and booking reference, and SHALL filter by request code.

#### Scenario: Pilot filters unaccompanied minors

- **WHEN** the pilot selects UMNR
- **THEN** only passengers with UMNR are listed

### Requirement: Old briefing addresses keep working

An address with a retired tab slug SHALL redirect to the phase or document that now holds its
content.

#### Scenario: Bookmarked OFP tab

- **WHEN** the pilot opens `/track/:id/briefing/ofp`
- **THEN** the briefing opens with the OFP document open
