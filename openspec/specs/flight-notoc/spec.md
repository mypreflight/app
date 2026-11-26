# Flight notification to captain

## Purpose

Presents the notification to captain a flight carries — what is aboard that the commander must know about, where it sits, and what to do if it goes wrong — as the immutable record of the load at the moment it was issued.

## Requirements

### Requirement: A notification is read only when one has been issued

The app SHALL resolve a flight to either a notification or a named reason there is none, and SHALL distinguish those reasons. It SHALL state, distinctly: that no notification has been issued because no preliminary loadsheet has been written; that the reader is not permitted to read this flight's notification; and that the request failed.

#### Scenario: A flight whose preliminary loadsheet has not been written

- **WHEN** the reader opens the notification of a flight whose preliminary loadsheet has not been written
- **THEN** the app states that the notification is issued from the preliminary loadsheet
- **AND** does not present an empty document

#### Scenario: A notification before the flight is released

- **GIVEN** a flight that has not been released and whose preliminary loadsheet has been written
- **WHEN** the reader opens its notification
- **THEN** the preliminary notification is shown
- **AND** the app does NOT withhold it pending release

#### Scenario: A flight the reader may not see

- **GIVEN** a reader whose role permits the notification only for a flight they captain
- **WHEN** they open another flight's notification
- **THEN** the app states they are not permitted to read it
- **AND** distinguishes that from no notification having been issued

#### Scenario: A failed read

- **WHEN** the notification cannot be read because the request failed
- **THEN** the app distinguishes that from no notification having been issued

### Requirement: A notification always says whether dangerous goods are aboard

Every notification states in words whether dangerous goods are loaded, worded by the app from whether the notification lists any dangerous goods or dry ice. Where none are loaded the app SHALL present that statement prominently, so a clean hold is stated rather than left as an absence. Where dangerous goods are loaded the entries themselves carry that fact, and the app SHALL list them rather than repeat the statement above them.

#### Scenario: A flight carrying no dangerous goods

- **WHEN** a notification reporting no dangerous goods is shown
- **THEN** its statement that none are loaded is presented prominently
- **AND** the document is not presented as empty or unavailable

#### Scenario: A flight carrying dangerous goods

- **WHEN** a notification reporting dangerous goods is shown
- **THEN** the dangerous goods it reports are listed

### Requirement: The notification names the stage it records

A preliminary notification is issued from the preliminary loadsheet and reissued whenever it changes, until release freezes it; a final one is issued when boarding finishes. Each is an immutable record of the load at the moment it was issued. The app SHALL present the latest issued notification and SHALL make clear which stage it is and when it was issued. Because the commander reads it while finishing boarding — before the final one exists — the app offers no control for moving between stages.

#### Scenario: The stage is named

- **WHEN** a notification is shown
- **THEN** its stage and the time it was issued are stated

#### Scenario: Only a preliminary notification exists

- **WHEN** a flight carries only a preliminary notification
- **THEN** it is shown as the preliminary notification

#### Scenario: The document is immutable

- **WHEN** a notification of either stage is shown
- **THEN** no control is offered that would alter it

### Requirement: What changed between stages is reported

The final notification reports what changed since the preliminary one. Where such a report is present the app SHALL present it alongside the final document. Where it is absent — as on a preliminary notification — the app SHALL present no change report rather than an empty one.

#### Scenario: A final notification reporting changes

- **WHEN** a final notification carrying a change report is shown
- **THEN** what changed since the preliminary notification is presented with it

#### Scenario: A preliminary notification

- **WHEN** a preliminary notification is shown
- **THEN** no change report is presented

#### Scenario: A load that moved between stages

- **GIVEN** a final notification reporting that a load moved from 11L to 21R
- **WHEN** the change report is shown
- **THEN** it names the air waybill with the position it left and the position it holds now
- **AND** a load that no longer holds a position reads as loose

### Requirement: Every dangerous good reports its declaration and its position

For each dangerous good the app SHALL report what the paper form's columns carry: the air waybill, the proper shipping name, the UN number, the class or division as the form prints it (with the compatibility group for an explosive), the subsidiary risk, the packing group, the number of packages, the net quantity per package, the dangerous goods handling code, whether it is restricted to cargo aircraft, the unit load device and the hold position it occupies, and the airport it comes off at. For radioactive material the app SHALL report the package category and transport index in place of a net quantity. Dry ice SHALL be reported as one line per compartment with the number of packages and the total quantity in that compartment, under its own proper shipping name, UN number, class and handling code. Where the load is loose or the airframe type carries no curated hold data, no position is reported and the app SHALL present that as how the load sits rather than as missing data.

#### Scenario: A declared dangerous good

- **WHEN** a dangerous goods entry is shown
- **THEN** its waybill, proper shipping name, UN number, class or division, packing group and handling code are reported
- **AND** its packages, net quantity per package, unit load device and position are reported

#### Scenario: A radioactive package

- **WHEN** an entry of radioactive material is shown
- **THEN** its package category and transport index are reported instead of a net quantity

#### Scenario: Dry ice

- **WHEN** dry ice is aboard
- **THEN** one line per compartment reports the total dry ice in it
- **AND** that line names no waybill, since it totals several

#### Scenario: An entry without a position

- **WHEN** a dangerous goods entry reports no position
- **THEN** the app presents its compartment, or presents it as loose load or as an uncurated airframe type
- **AND** does not report it as missing data

#### Scenario: A cargo-aircraft-only entry

- **WHEN** an entry restricted to cargo aircraft is shown
- **THEN** the restriction is stated in words

#### Scenario: Hazard is not carried by colour alone in the app

- **WHEN** a dangerous goods entry is shown on an in-app surface
- **THEN** its hazard class is conveyed in text
- **AND** no meaning is carried by colour alone

### Requirement: Every dangerous good carries its drill

Each dangerous good arrives with the emergency response drill derived from the published drill chart. As on the paper form, the entry SHALL show the emergency response code, written from the drill number and drill letters the API reports, and the code SHALL open the drill: the inherent risk, the risk to aircraft and occupants, the spill and fire procedure and the additional risks the drill letter adds. The app SHALL render the supplied text and SHALL NOT compose, summarise or paraphrase it.

#### Scenario: Reading a drill

- **WHEN** the reader opens a dangerous goods entry's emergency response code
- **THEN** its inherent risk, risk to aircraft and occupants, and spill and fire procedure are presented
- **AND** the additional risks it reports are presented

#### Scenario: The text is the API's

- **WHEN** any drill text is presented
- **THEN** it is the text the API supplied, unaltered

#### Scenario: A drill with no additional risk

- **WHEN** a drill reports no risk beyond the drill itself
- **THEN** that is presented as the API states it rather than omitted

### Requirement: Special loads are reported with their handling codes

For each notifiable special load, perishable and temperature-controlled loads included, the app SHALL report the air waybill, the description, the handling codes that make it notifiable, the number of packages, its gross weight, its unit load device and position where it has them, the airport it comes off at, and its supplementary information, one line each in the form's wording: the handling remark, the temperature to keep, the container or packing that keeps it, the hold conditions it needs and the weight and dimensions of its heaviest piece. The API supplies each of these as a coded fact; the app SHALL word them, so the panel and the PDF print the same lines.

#### Scenario: A special load

- **WHEN** a special load is shown
- **THEN** its waybill, description, handling codes, packages, gross weight and position are reported
- **AND** its supplementary information is presented line by line

#### Scenario: A special load with no supplementary information

- **WHEN** a special load carries no supplementary information
- **THEN** no empty line is presented for it

#### Scenario: Sensitive consignments are reported plainly

- **WHEN** a special load concerns human remains or another sensitive consignment
- **THEN** it appears as an ordinary row of the notification
- **AND** does not appear in a heading, a figure or a summary line

### Requirement: The notification shows what the paper form shows

The notification SHALL present the header, the dangerous goods, the special load, the special category passengers and the certification, and nothing the paper form does not carry. Cold chain assessments and the load summary SHALL NOT be presented on the notification; they are presented with the loadsheet of the same stage.

#### Scenario: No cold chain on the notification

- **WHEN** a notification carrying cold chain assessments is shown
- **THEN** no cold chain assessment and no load summary are presented on it

### Requirement: Listed sections fold to a summary

The dangerous goods, special load and special category passengers sections SHALL each show how many entries they hold, and the pilot SHALL be able to fold each to a single line summarising what it holds and unfold it again. Sections SHALL open unfolded. A notification with no dangerous goods SHALL show its dangerous goods section as a statement that none are loaded, which does not fold.

#### Scenario: Folding the special load

- **WHEN** the pilot folds the special load section of a notification listing special loads
- **THEN** its entries are hidden and a one-line summary of what it holds is shown beside its title and count

#### Scenario: No dangerous goods

- **WHEN** a notification reporting no dangerous goods is shown
- **THEN** its dangerous goods section states that no dangerous goods are loaded

### Requirement: The notification carries the form's header and certification

Every notification carries a header. The app SHALL present the port of loading, the airport of unloading, the flight number and date, and the aircraft registration and type above the entries, and SHALL present who prepared it, who supervised loading and certified the positions, and the emergency telephone number below them. A notification issued on the form before this one is not served by the API and SHALL read as not issued.

#### Scenario: The header and certification

- **WHEN** a notification is shown
- **THEN** its port of loading, flight, date and aircraft are presented above the entries
- **AND** who prepared it, who supervised loading and the emergency telephone are presented below them

#### Scenario: A notification issued on the earlier form

- **WHEN** a flight's only notification was issued on the form before this one
- **THEN** the app states that no notification has been issued

### Requirement: Special category passengers are notified

The commander is told in advance which special category passengers are aboard. Where the notification reports special category passengers, the app SHALL present each with their seat, their special service code in words and code, and the remarks the form carries for that code, in the form's wording. For a battery-powered mobility aid the remarks SHALL say how its battery travels and which hold compartment the aid is in, as the API reports it.

#### Scenario: A passenger with a battery-powered wheelchair

- **WHEN** a passenger with a battery-powered mobility aid is reported
- **THEN** their seat and code are presented
- **AND** where the mobility aid and its battery are carried is presented

#### Scenario: No special category passengers

- **WHEN** the notification reports none
- **THEN** no section for them is presented

### Requirement: Acknowledgement is reported, not requested

The preliminary notification is accepted by the pilot checking in and the final one by the request that finishes boarding, so there is no separate acknowledgement action. The app SHALL report who accepted the document and when where it has been accepted, and SHALL offer no control that acknowledges it. Where it has not been accepted the app SHALL report nothing, because the reader is performing that acceptance as they read.

#### Scenario: An accepted notification

- **WHEN** a notification reporting an acknowledging pilot and a time is shown
- **THEN** who accepted it and when are reported

#### Scenario: An unaccepted notification

- **WHEN** a notification reporting no acknowledgement is shown
- **THEN** no acknowledgement is reported for it

#### Scenario: No acknowledgement control

- **WHEN** any notification is shown
- **THEN** no control is offered that would acknowledge it

### Requirement: The notification is read where the commander accepts the load

The notification is the commander's pre-departure artifact, so the app SHALL present it within the flow that finishes boarding rather than as a surface of its own, and SHALL require the commander to confirm it there before boarding can be finished. It SHALL offer no control that acknowledges the notification separately.

#### Scenario: A pilot reads the notification while finishing boarding

- **WHEN** a pilot finishing boarding reaches the notification step
- **THEN** the notification of the flight they are operating is shown

#### Scenario: The notification must be confirmed

- **WHEN** the pilot has not confirmed the notification step
- **THEN** boarding cannot be finished

#### Scenario: A reader not entitled to the notification

- **WHEN** the notification cannot be read because the reader is not permitted to
- **THEN** the app states they are not permitted to read it
