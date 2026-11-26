# Notification to captain document

## Purpose

Lets the reader download the notification to captain as the paper form a commander is handed: a landscape A4 sheet laid out column for column like the IATA-style NOTOC, ready to print or file.

## Requirements

### Requirement: The notification is downloadable as a PDF

The app SHALL present the notification digitally by default and SHALL offer, beside it, a download of the same notification as a PDF. The download SHALL carry the same entries as the panel, and neither SHALL carry content the other omits, apart from the paper form's printed instructions, distribution list and signature lines.

#### Scenario: Downloading the PDF

- **WHEN** the reader chooses to download the notification
- **THEN** a PDF of it is downloaded, named after the flight and its date

#### Scenario: The two forms agree

- **GIVEN** a notification shown in the panel and downloaded as a PDF
- **WHEN** the two are compared
- **THEN** they carry the same dangerous goods, special loads, special category passengers, header and certification

#### Scenario: The PDF cannot be prepared

- **WHEN** preparing the PDF fails
- **THEN** the app says so and the reader can try again

### Requirement: The PDF is laid out as the paper form

The PDF SHALL be a landscape A4 form with: the distribution list and the title; boxes for the completion instructions, the port of loading, flight number, date and aircraft registration, and the dangerous goods preparation certification; a dangerous goods table whose columns are numbered 1 to 15 (destination, air waybill, proper shipping name, class or division, UN number, subsidiary risk, packages, net quantity, transport index, radioactive category, packing group, code, CAO, loaded ULD and position, emergency response code); a special load table (destination, air waybill, contents, packages, quantity, supplementary information, code, loaded ULD and position); a table of special category passengers where there are any; and the captain's acceptance beside the certification by the person supervising loading. Tables SHALL keep blank rows up to a minimum, as a printed form does.

#### Scenario: The form's columns

- **WHEN** the PDF of a notification carrying dangerous goods is opened
- **THEN** each dangerous good fills one row of the numbered columns

#### Scenario: A long notification

- **WHEN** a notification has more rows than one page holds
- **THEN** the form continues on further pages, each numbered, and no row is split across a page
- **AND** each further page names the notification, the flight, its date, the aircraft registration and the port of loading at its top
- **AND** a table that continues onto a further page repeats its title and column headings there
- **AND** a table starts on a page only with its headings and its first rows, and otherwise starts on the next page
- **AND** the captain's acceptance and the loading certification come after the last table

### Requirement: The form prints whole and carries MyPreflight's mark

The PDF SHALL keep a margin of at least 10 mm on every side of every page, the page's footer and its continuation heading included, so a printer reproduces the whole form. The first page SHALL carry the MyPreflight logo in dark grey at its top left, where a paper form carries its owner's mark.

#### Scenario: Printing the form

- **WHEN** a page of the PDF is printed
- **THEN** nothing on it lies within 10 mm of the paper's edge

#### Scenario: The mark on the first page

- **WHEN** the PDF is opened
- **THEN** the top left of its first page shows the MyPreflight logo in dark grey

### Requirement: The form names the operator, not a real form's owner

The PDF SHALL carry the flight's operator wherever a paper form names its owner in words (the instructions and the manuals the certifications refer to), and SHALL NOT carry the name, mark or form number of any real company's form.

#### Scenario: The operator's name

- **WHEN** the PDF is opened
- **THEN** its instructions and certifications name the flight's operator

### Requirement: Signatures are filled from the record

The PDF SHALL fill the preparer and the loading supervisor from the notification's header, and the captain's name and signature only where the notification has been accepted. Where the notification has not been accepted, the captain's lines SHALL stay blank, as on an unsigned form.

#### Scenario: An accepted notification

- **WHEN** an accepted notification is downloaded
- **THEN** the captain's name and the time of acceptance fill the captain's lines

#### Scenario: An unaccepted notification

- **WHEN** a notification that has not been accepted is downloaded
- **THEN** the captain's lines are blank

### Requirement: The form is legible without colour

The PDF SHALL be black on white, carry every class, category and restriction in text, and SHALL NOT depend on colour or hazard marks for any meaning, so it survives a monochrome printer.

#### Scenario: Printed in monochrome

- **WHEN** the PDF is printed without colour
- **THEN** every entry remains identifiable from its text
