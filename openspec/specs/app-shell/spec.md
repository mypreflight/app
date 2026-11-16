# app-shell Specification

## Purpose
Gives every signed-in page a top bar for its own context and the account, a bottom bar for its
actions, and a sidebar foot for the app's state, so the outlet holds only the page's content.

## Requirements

### Requirement: Account menu in the top bar

From the `md` breakpoint the app SHALL show a top bar above the outlet with a round button carrying
the user's initials at its right end. The button SHALL open a menu with the user's name and email,
a Settings link to `/me/account`, a link to the Discord community, a Light, Dark and Auto theme
switch, and a Sign out link to `/sign-out`.

#### Scenario: Pilot signs out from the menu

- **WHEN** the pilot opens the account menu and selects Sign out
- **THEN** the app navigates to `/sign-out`

#### Scenario: Pilot switches the theme from the menu

- **WHEN** the pilot opens the account menu and presses Dark
- **THEN** the app turns dark, Dark shows as pressed and the menu stays open

### Requirement: Readings and version at the foot of the sidebar

From the `md` breakpoint the sidebar SHALL end with any readings the page provides, then the app
version and a link to the changelog.

#### Scenario: Flight page readings

- **WHEN** a flight page is open
- **THEN** the foot of the sidebar shows the AOC and ADS-B readings above the version

### Requirement: Bottom bar for the page's actions

From the `md` breakpoint the app SHALL show a bar below the outlet holding what the page puts there,
and SHALL leave it out of the layout while the page puts nothing there.

#### Scenario: Page without actions

- **WHEN** a page that fills no bottom bar is open
- **THEN** the outlet reaches down to the bottom margin

### Requirement: Flight identity in the top bar

On a flight page from the `md` breakpoint the top bar SHALL carry, on one line, the operator's fin,
the flight number, the airport pair, the cities with the block time, the registration with the
airframe name, and the Briefing and Tracking switch.

#### Scenario: Narrow screen

- **WHEN** the viewport is below `md`
- **THEN** the flight page shows its header inside the page as before
