# Tasks

## 1. Shell

- [x] 1.1 `ShellSlotsProvider` and `ShellSlotPortal` with three slots in `app/app-state/useShellSlots.tsx`.
- [x] 1.2 `AccountMenu`: initials button, menu with name, email, Settings, Discord, theme and Sign out.
- [x] 1.3 `ThemeModeSwitch`: Light, Dark and Auto in the account menu.
- [x] 1.4 `AppTopBar`, and `AppBottomBar` that takes no room while empty.
- [x] 1.5 `AppLayout` renders both bars from `md`; the sidebar drops the account tile and "Your account"
  and ends in `SidebarStatus` (page readings, version, What's new).

## 2. Flight top bar

- [x] 2.1 `FlightTopBar`: one line with fin, flight number, airport pair, cities and block time,
  registration and airframe, and a compact view switch.
- [x] 2.2 `ViewSwitch` gains a compact size.
- [x] 2.3 The flight page portals `FlightTopBar` and `FlightQuickStatus` from `md`, keeps today's header
  below it, and shows the diversion banner in the outlet from `md`.

## 3. Phases and addresses

- [x] 3.1 `briefingPhase.ts`: phases, slugs, documents, legacy slug resolution, current phase.
- [x] 3.2 Replace `FlightDataTab` in `trackingView.ts`, `useTrackingView`, `DelayNotice` and `NextStepPanel`.
- [x] 3.3 `BriefingPhaseTabs` with Done and Now marks and a one-line summary per phase.

## 4. Phase pages

- [x] 4.1 `BriefingColumns` layout.
- [x] 4.2 `ParkingPositionRunwayBox` takes `end`; `AirportWeatherPanel` sizes by container.
- [x] 4.3 `AirportWeatherCard` loading an airport's weather.
- [x] 4.4 `PassengersSummaryCard`: cabin counts and special request chips opening the PIL.
- [x] 4.5 `FixFuelReportsCard`: the oceanic fixes with planned, minimum and reported fuel, and Report.
- [x] 4.6 `PreflightBriefing` (departure; fuel and load; passengers, crew and destination), `EnRouteBriefing`,
  `ArrivalBriefing`.
- [x] 4.7 `LandingFiguresCard`: planned, expected and minimum fuel at the destination, margin and landing weight.

## 5. Documents

- [x] 5.1 `BriefingDocumentButtons` and `BriefingPhaseHeader`.
- [x] 5.2 `PassengerInformationList`.
- [x] 5.3 `BriefingDocumentDrawer` rendering every document.
- [x] 5.4 `BriefingRecordsStrip` with Load, Records and the emergency and diversion actions; `FlightRecords`
  puts it in the bottom bar on both views from `md` and at the end of the page below it, and opens
  its documents over the view the pilot is on (`useFlightDocuments`).
- [x] 5.5 `FlightBriefing` replaces the tab bar in `FlightTrackingDashboard`; retire `FlightDataTabs`,
  `FlightOverviewTab`, `TopBarUserTile` and `SettingsSidebarItems`.

## 6. Stories and checks

- [x] 6.1 A story for every new component.
- [x] 6.2 Lint, typecheck, build, Storybook build and story tests pass.
- [x] 6.3 Checked in the browser at 1440px and phone width, light and dark.
