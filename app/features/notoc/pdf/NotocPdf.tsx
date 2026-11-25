import latinItalic from "@fontsource/arimo/files/arimo-latin-400-italic.woff?url";
import latinRegular from "@fontsource/arimo/files/arimo-latin-400-normal.woff?url";
import latinBold from "@fontsource/arimo/files/arimo-latin-700-normal.woff?url";
import extendedItalic from "@fontsource/arimo/files/arimo-latin-ext-400-italic.woff?url";
import extendedRegular from "@fontsource/arimo/files/arimo-latin-ext-400-normal.woff?url";
import extendedBold from "@fontsource/arimo/files/arimo-latin-ext-700-normal.woff?url";
import { Document, Font, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import React from "react";
import { designatorOf } from "~/features/cargo-hold/lib/designator";
import type { LoadingPosition } from "~/features/cargo-hold/model";
import { netQuantityOf, responseCodeOf } from "~/features/cargo-manifest/lib/cargoWording";
import {
  DRY_ICE,
  formDate,
  kilograms,
  supplementaryLinesOf,
  transportIndexOf,
  unNumberOf,
} from "~/features/notoc/lib/notocFormat";
import { groupSpecialPassengers } from "~/features/notoc/lib/specialPassengerGroups";
import type {
  FlightNotoc,
  NotocColdChain,
  NotocDangerousGoods,
  NotocDryIce,
  NotocHeader,
  NotocSpecialLoad,
  NotocSpecialPassenger,
} from "~/features/notoc/model";
import { toHuman } from "~/i18n/translate";
import { dateToIcaoDate } from "~/shared/ui/Date/FormattedIcaoDate";
import { dateToIcaoTime } from "~/shared/ui/Date/FormattedIcaoTime";

Font.register({
  family: "Arimo",
  fonts: [
    { src: latinRegular, fontWeight: 400 },
    { src: latinBold, fontWeight: 700 },
    { src: latinItalic, fontWeight: 400, fontStyle: "italic" },
  ],
});
Font.register({
  family: "ArimoExtended",
  fonts: [
    { src: extendedRegular, fontWeight: 400 },
    { src: extendedBold, fontWeight: 700 },
    { src: extendedItalic, fontWeight: 400, fontStyle: "italic" },
  ],
});
Font.registerHyphenationCallback((word) => [word]);

export type NotocPdfAcceptance = {
  name: string;
  at: string;
};

export type NotocPdfProps = {
  notoc: FlightNotoc;
  acceptance: NotocPdfAcceptance | null;
};

const FONT = ["Arimo", "ArimoExtended"];
const RULE = 1.4;
const HAIRLINE = 0.8;
const MIN_ROWS = 5;

const DANGEROUS_GOODS_COLUMNS = [5.5, 8.5, 17, 4.6, 5.8, 3.6, 5, 8, 7.4, 6.6, 5, 3.8, 3.2, 6.5, 4.5, 5];
const DANGEROUS_GOODS_COLUMN_IDS = [
  "destination",
  "awb",
  "shipping-name",
  "class",
  "un-number",
  "subsidiary-risk",
  "packages",
  "net-quantity",
  "transport-index",
  "category",
  "packing-group",
  "code",
  "cao",
  "uld",
  "position",
  "erc",
];
const SPECIAL_LOAD_COLUMNS = [5.5, 8.5, 26, 5, 8, 25, 7, 7.5, 7.5];
const SPECIAL_LOAD_COLUMN_IDS = [
  "destination",
  "awb",
  "contents",
  "packages",
  "quantity",
  "supplementary",
  "code",
  "uld",
  "position",
];

const styles = StyleSheet.create({
  page: { fontFamily: FONT, fontSize: 7.5, color: "#000", paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 },
  top: { flexDirection: "row", alignItems: "flex-end", marginBottom: 4 },
  mark: {
    width: 30,
    height: 30,
    borderWidth: RULE,
    transform: "rotate(45deg)",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
  },
  markText: { transform: "rotate(-45deg)", fontSize: 8, fontWeight: 700 },
  distribution: { fontSize: 7.5, lineHeight: 1.25 },
  title: { flexGrow: 1, textAlign: "right", fontSize: 19, fontWeight: 700, letterSpacing: 2.4, marginLeft: 16 },
  boxes: { flexDirection: "row", gap: 6, marginBottom: 4 },
  box: { borderWidth: RULE, paddingHorizontal: 5, paddingVertical: 4 },
  boxTitle: { fontSize: 9, fontWeight: 700, marginBottom: 2 },
  instruction: { flexDirection: "row", fontSize: 6.2, lineHeight: 1.18 },
  facts: { borderWidth: RULE, flexBasis: 0, flexGrow: 0.95 },
  fact: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 5 },
  factLabel: { fontSize: 8, fontWeight: 700 },
  factValue: { fontSize: 10, fontWeight: 400 },
  table: { borderWidth: RULE, marginBottom: 4 },
  tableTitle: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: RULE,
    paddingHorizontal: 4,
    minHeight: 14,
  },
  tableTitleText: { fontSize: 9.5, fontWeight: 700 },
  row: { flexDirection: "row", borderBottomWidth: HAIRLINE, minHeight: 13 },
  lastRow: { flexDirection: "row", minHeight: 13 },
  cell: { borderRightWidth: HAIRLINE, paddingHorizontal: 2.5, paddingVertical: 1.5, justifyContent: "center" },
  lastCell: { paddingHorizontal: 2.5, paddingVertical: 1.5, justifyContent: "center" },
  number: { fontSize: 10, fontWeight: 700, textAlign: "center" },
  heading: { fontSize: 6.8, textAlign: "center", lineHeight: 1.15 },
  data: { fontSize: 7.5 },
  bottom: { flexDirection: "row", gap: 6 },
  signatureLine: { flexDirection: "row", alignItems: "flex-end", marginTop: 3 },
  dotted: { flexGrow: 1, borderBottomWidth: 0.8, borderBottomStyle: "dotted", marginLeft: 3, minHeight: 11 },
  signature: { fontStyle: "italic", fontSize: 9, paddingLeft: 6 },
  printed: { fontSize: 9, paddingLeft: 6 },
  hint: { fontSize: 6, fontStyle: "italic", textAlign: "right" },
  footer: {
    position: "absolute",
    bottom: 8,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 6.5,
  },
});

function Cell({ width, last = false, children }: { width: number; last?: boolean; children?: React.ReactNode }) {
  return <View style={[last ? styles.lastCell : styles.cell, { width: `${width}%` }]}>{children}</View>;
}

function DataText({ children, bold = false }: { children?: React.ReactNode; bold?: boolean }) {
  return <Text style={[styles.data, bold ? { fontWeight: 700 } : {}]}>{children}</Text>;
}

function SignatureLine({ label, value, italic = false }: { label: string; value: string; italic?: boolean }) {
  return (
    <View style={styles.signatureLine}>
      <Text style={{ fontSize: 8 }}>{label}</Text>
      <View style={styles.dotted}>
        <Text style={italic ? styles.signature : styles.printed}>{value}</Text>
      </View>
    </View>
  );
}

function positionOf(entry: { loadingPosition: LoadingPosition | null; compartment: number | null }): string {
  if (entry.loadingPosition !== null) {
    return designatorOf(entry.loadingPosition);
  }

  return entry.compartment === null ? "LOOSE" : `COMP.${entry.compartment}`;
}

type FormRow<T> = {
  id: string;
  entry: T | null;
};

function padded<T>(rows: T[], idOf: (row: T) => string): FormRow<T>[] {
  const filled = rows.map((row, position) => ({ id: `${idOf(row)}-${position}`, entry: row }));
  const blanks = Array.from({ length: Math.max(0, MIN_ROWS - rows.length) }, (_, position) => ({
    id: `blank-${position}`,
    entry: null,
  }));

  return [...filled, ...blanks];
}

function dangerousGoodsCells(entry: NotocDangerousGoods): string[] {
  return [
    entry.unloadingAirport,
    entry.awb,
    entry.properShippingName.toUpperCase(),
    entry.classOrDivision,
    unNumberOf(entry),
    entry.subsidiaryRisk ?? "",
    String(entry.packages),
    entry.radioactive === null ? netQuantityOf(entry.netQuantity).toUpperCase() : "",
    entry.radioactive === null ? "" : transportIndexOf(entry.radioactive),
    entry.radioactive?.category ?? "",
    entry.packingGroup ?? "",
    entry.impCode,
    entry.cargoAircraftOnly ? "X" : "",
    entry.uldId ?? "",
    positionOf(entry),
    responseCodeOf(entry.drill.responseCode),
  ];
}

function dryIceCells(entry: NotocDryIce): string[] {
  return [
    entry.unloadingAirport,
    "",
    DRY_ICE.properShippingName.toUpperCase(),
    DRY_ICE.classOrDivision,
    DRY_ICE.unNumber,
    "",
    String(entry.packages),
    `${kilograms(entry.kg).toUpperCase()} TOTAL`,
    "",
    "",
    "",
    DRY_ICE.impCode,
    "",
    "",
    positionOf({ loadingPosition: null, compartment: entry.compartment }),
    responseCodeOf(entry.drill.responseCode),
  ];
}

function DangerousGoodsRow({ cells, last }: { cells: string[] | null; last: boolean }) {
  const widths = DANGEROUS_GOODS_COLUMNS;
  const values = cells ?? widths.map(() => "");

  return (
    <View style={last ? styles.lastRow : styles.row} wrap={false}>
      {DANGEROUS_GOODS_COLUMN_IDS.map((id, column) => (
        <Cell key={id} width={widths[column]} last={column === widths.length - 1}>
          <DataText>{values[column]}</DataText>
        </Cell>
      ))}
    </View>
  );
}

function SpecialLoadRow({
  load,
  coldChain,
  last,
}: {
  load: NotocSpecialLoad | null;
  coldChain: NotocColdChain[];
  last: boolean;
}) {
  const widths = SPECIAL_LOAD_COLUMNS;
  const values =
    load === null
      ? widths.map(() => "")
      : [
          load.unloadingAirport,
          load.awb,
          load.description.toUpperCase(),
          String(load.pieces),
          `${load.grossKg} KG`,
          supplementaryLinesOf(load, coldChain).join("\n"),
          load.shc.join(" "),
          load.uldId ?? "",
          positionOf(load),
        ];

  return (
    <View style={last ? styles.lastRow : styles.row} wrap={false}>
      {SPECIAL_LOAD_COLUMN_IDS.map((id, column) => (
        <Cell key={id} width={widths[column]} last={column === widths.length - 1}>
          <DataText>{values[column]}</DataText>
        </Cell>
      ))}
    </View>
  );
}

function ColumnNumbers({ widths, labels }: { widths: number[]; labels: string[] }) {
  return (
    <View style={styles.row}>
      {labels.map((label, index) => (
        <Cell key={label} width={widths[index]} last={index === labels.length - 1}>
          <Text style={styles.number}>{label}</Text>
        </Cell>
      ))}
    </View>
  );
}

function DangerousGoodsTable({ entries, dryIce }: { entries: NotocDangerousGoods[]; dryIce: NotocDryIce[] }) {
  const widths = DANGEROUS_GOODS_COLUMNS;
  const loadedWidth = widths[13] + widths[14];
  const headingsBefore = [
    "Destination",
    "Air Waybill Number Consignment Note",
    "Proper Shipping Name",
    "Class or Division",
    "UN or ID Number",
    "Sub-risk",
    "No. of Packages",
    "Net Quantity Non-Radioactive Material",
    "Transport Index Radioactive Material",
    "Radioactive Package Category",
    "UN Packing Group",
    "Code",
    "CAO",
  ];
  const rows = padded(
    [...entries.map(dangerousGoodsCells), ...dryIce.map(dryIceCells)],
    (cells) => `${cells[1]}-${cells[4]}`,
  );

  return (
    <View style={styles.table}>
      <View style={styles.tableTitle}>
        <Text style={styles.tableTitleText}>DANGEROUS GOODS</Text>
      </View>
      <ColumnNumbers
        widths={[...widths.slice(0, 13), loadedWidth, widths[15]]}
        labels={["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15"]}
      />
      <View style={styles.row}>
        {headingsBefore.map((heading, index) => (
          <Cell key={heading} width={widths[index]}>
            <Text style={index === 2 ? [styles.heading, { fontSize: 8.5 }] : styles.heading}>{heading}</Text>
          </Cell>
        ))}
        <View style={[styles.cell, { width: `${loadedWidth}%`, padding: 0 }]}>
          <Text style={[styles.heading, { paddingVertical: 1.5, borderBottomWidth: HAIRLINE }]}>Loaded</Text>
          <View style={{ flexDirection: "row", flexGrow: 1 }}>
            <View style={[styles.cell, { width: `${(widths[13] / loadedWidth) * 100}%` }]}>
              <Text style={styles.heading}>ULD</Text>
            </View>
            <View style={[styles.lastCell, { width: `${(widths[14] / loadedWidth) * 100}%` }]}>
              <Text style={styles.heading}>Position</Text>
            </View>
          </View>
        </View>
        <Cell width={widths[15]} last>
          <Text style={styles.heading}>Emergency Response Code</Text>
        </Cell>
      </View>
      {rows.map((row) => (
        <DangerousGoodsRow key={row.id} cells={row.entry} last={row === rows[rows.length - 1]} />
      ))}
    </View>
  );
}

function SpecialLoadTable({
  loads,
  coldChain,
  preparedBy,
}: {
  loads: NotocSpecialLoad[];
  coldChain: NotocColdChain[];
  preparedBy: string;
}) {
  const widths = SPECIAL_LOAD_COLUMNS;
  const loadedWidth = widths[7] + widths[8];
  const headings = [
    "Destination",
    "Air Waybill Number Consignment Note",
    "Contents and Description",
    "No. of Packages",
    "Quantity",
    "Supplementary Information",
    "Code",
  ];
  const rows = padded(loads, (load) => load.awb);

  return (
    <View style={styles.table}>
      <View style={styles.tableTitle}>
        <Text style={styles.tableTitleText}>SPECIAL LOAD</Text>
        <Text style={{ fontSize: 7.5, marginLeft: 4 }}>
          {" "}
          - the person entering the Special Load details is to print their name here {"->"} (1) Freight Agent:
        </Text>
        <View style={[styles.dotted, { marginRight: 8 }]}>
          <Text style={styles.printed}>{preparedBy}</Text>
        </View>
        <Text style={{ fontSize: 7.5 }}>(2) Pit Crew Leader:</Text>
        <View style={styles.dotted} />
      </View>
      <View style={styles.row}>
        {headings.map((heading, index) => (
          <Cell key={heading} width={widths[index]}>
            <Text style={index === 2 || index === 5 ? [styles.heading, { fontSize: 8.5 }] : styles.heading}>
              {heading}
            </Text>
          </Cell>
        ))}
        <View style={[styles.lastCell, { width: `${loadedWidth}%`, padding: 0 }]}>
          <Text style={[styles.heading, { paddingVertical: 1.5, borderBottomWidth: HAIRLINE }]}>Loaded</Text>
          <View style={{ flexDirection: "row", flexGrow: 1 }}>
            <View style={[styles.cell, { width: "50%" }]}>
              <Text style={styles.heading}>ULD</Text>
            </View>
            <View style={[styles.lastCell, { width: "50%" }]}>
              <Text style={styles.heading}>Position</Text>
            </View>
          </View>
        </View>
      </View>
      {rows.map((row) => (
        <SpecialLoadRow key={row.id} load={row.entry} coldChain={coldChain} last={row === rows[rows.length - 1]} />
      ))}
    </View>
  );
}

const PASSENGER_COLUMNS = [6, 18, 5, 31, 40];
const PASSENGER_COLUMN_IDS = ["code", "category", "count", "seats", "information"];

function SpecialPassengerTable({ passengers }: { passengers: NotocSpecialPassenger[] }) {
  const widths = PASSENGER_COLUMNS;
  const headings = ["Code", "Special Category", "No. of Pax", "Seats", "Supplementary Information"];
  const groups = groupSpecialPassengers(passengers);

  return (
    <View style={styles.table}>
      <View style={styles.tableTitle}>
        <Text style={styles.tableTitleText}>SPECIAL CATEGORY PASSENGERS</Text>
      </View>
      <View style={styles.row}>
        {PASSENGER_COLUMN_IDS.map((id, column) => (
          <Cell key={id} width={widths[column]} last={column === widths.length - 1}>
            <Text style={column === 1 || column === 4 ? [styles.heading, { fontSize: 8.5 }] : styles.heading}>
              {headings[column]}
            </Text>
          </Cell>
        ))}
      </View>
      {groups.map((group, position) => {
        const values = [
          group.ssr,
          toHuman.flight.specialServiceRequest(group.ssr).toUpperCase(),
          String(group.seats.length),
          group.seats.join(" "),
          group.remarks.join("\n"),
        ];

        return (
          <View
            key={`${group.ssr}-${group.seats[0]}`}
            style={position === groups.length - 1 ? styles.lastRow : styles.row}
            wrap={false}
          >
            {PASSENGER_COLUMN_IDS.map((id, column) => (
              <Cell key={id} width={widths[column]} last={column === widths.length - 1}>
                <DataText>{values[column]}</DataText>
              </Cell>
            ))}
          </View>
        );
      })}
    </View>
  );
}

function Instructions({ operator }: { operator: string }) {
  const lines = [
    `A NOTOC is to be issued whenever dangerous goods (DGs) or other special load items are to be carried on ${operator} aircraft.`,
    `The NOTOC form is to be prepared by the freight handling agent contracted to dispatch consignments on ${operator} when DGs and/or Special Load are consigned as freight.`,
    "The freight agent must certify the DGs entered in the DGs Preparation Certification field in the top right-hand section of the form, whenever freight loads containing dangerous goods are dispatched.",
    "The person entering Special Load details must annotate their name in the applicable name field of the Special Load section of the form.",
    "Before loading, the person supervising loading operations is to check the dangerous goods items for evidence of any damage or leakage. After loading, they certify in the bottom right-hand section that the items have been loaded in the locations specified on the form.",
    "The NOTOC is to be given to the captain, who is to certify acceptance of the NOTOC in the bottom left-hand corner of the form.",
  ];

  return (
    <View style={[styles.box, { flexBasis: 0, flexGrow: 1.62 }]}>
      <Text style={styles.boxTitle}>INSTRUCTIONS FOR COMPLETION OF NOTOC</Text>
      {lines.map((line, index) => (
        <View key={line} style={styles.instruction}>
          <Text style={{ width: 10 }}>{index + 1}.</Text>
          <Text style={{ flex: 1 }}>{line}</Text>
        </View>
      ))}
    </View>
  );
}

function Facts({ header }: { header: NotocHeader }) {
  const facts = [
    { label: "PORT OF LOADING:", value: `${header.stationOfLoadingCity} (${header.stationOfLoading})` },
    { label: "FLIGHT NUMBER:", value: header.flightNumber },
    { label: "DATE:", value: formDate(header.flightDate) },
    { label: "AIRCRAFT REG:", value: header.aircraftRegistration },
  ];

  return (
    <View style={styles.facts}>
      {facts.map((fact, index) => (
        <View key={fact.label} style={[styles.fact, index < facts.length - 1 ? { borderBottomWidth: HAIRLINE } : {}]}>
          <Text>
            <Text style={styles.factLabel}>{fact.label} </Text>
            <Text style={styles.factValue}>{fact.value}</Text>
          </Text>
        </View>
      ))}
    </View>
  );
}

function PreparationCertification({ header }: { header: NotocHeader }) {
  return (
    <View style={[styles.box, { flexBasis: 0, flexGrow: 1.05 }]}>
      <Text style={[styles.boxTitle, { fontSize: 10 }]}>DGs PREPARATION CERTIFICATION</Text>
      <Text style={{ fontSize: 7.2, lineHeight: 1.25 }}>
        (To be completed by a certified person when dangerous goods are to be consigned as freight.)
      </Text>
      <Text style={{ fontSize: 7.2, lineHeight: 1.25, marginTop: 3 }}>
        I certify that this NOTOC has been prepared in compliance with the procedures for the acceptance and dispatch of
        dangerous goods as detailed in the {header.operatorName} Dangerous Goods Manual.
      </Text>
      <SignatureLine label="Signature:" value={header.preparedBy} italic />
      <SignatureLine label="Prepared By:" value={header.preparedBy} />
      <Text style={styles.hint}>(Print Name)</Text>
    </View>
  );
}

function CaptainAcceptance({ acceptance }: { acceptance: NotocPdfAcceptance | null }) {
  const accepted =
    acceptance === null
      ? ""
      : `${acceptance.name}, ${dateToIcaoDate(new Date(acceptance.at))} ${dateToIcaoTime(new Date(acceptance.at))}`;

  return (
    <View style={[styles.box, { flexBasis: 0, flexGrow: 1, flexDirection: "row", gap: 6 }]}>
      <View style={{ width: "36%" }}>
        <Text style={styles.boxTitle}>ACCEPTANCE BY CAPTAIN:</Text>
        <Text style={{ fontSize: 7.5, lineHeight: 1.25 }}>
          I accept the loading locations of the items specified on this NOTOC.
        </Text>
      </View>
      <View style={{ flexGrow: 1 }}>
        <SignatureLine label="Captain's Name:" value={acceptance?.name ?? ""} />
        <Text style={styles.hint}>(Print Name)</Text>
        <SignatureLine label="Captain's Signature:" value={accepted} italic />
      </View>
    </View>
  );
}

function LoadingCertification({ header }: { header: NotocHeader }) {
  return (
    <View style={[styles.box, { flexBasis: 0, flexGrow: 2, flexDirection: "row", gap: 6 }]}>
      <View style={{ width: "62%", borderRightWidth: HAIRLINE, paddingRight: 5 }}>
        <Text style={styles.boxTitle}>CERTIFICATION BY PERSON SUPERVISING LOADING OPERATIONS:</Text>
        <Text style={{ fontSize: 7.5, lineHeight: 1.25 }}>
          I certify that this aircraft has been loaded in accordance with the procedures detailed in the{" "}
          {header.operatorName} Airport Handling Manual and Dangerous Goods Manual, that the items have been checked and
          showed no evidence of damage or leakage, and that this NOTOC accurately reflects the locations of the DGs
          and/or special load items on this aircraft.
        </Text>
      </View>
      <View style={{ flexGrow: 1 }}>
        <SignatureLine label="Certified By:" value={header.loadingSupervisor} />
        <Text style={styles.hint}>(Print Name)</Text>
        <SignatureLine label="Signature:" value={header.loadingSupervisor} italic />
      </View>
    </View>
  );
}

export function NotocPdf({ notoc, acceptance }: NotocPdfProps) {
  const { header } = notoc.document;
  const issuedAt = new Date(notoc.issuedAt);
  const stage = notoc.stage === "final" ? "Final" : "Preliminary";

  return (
    <Document
      title={`NOTOC ${header.flightNumber} ${formDate(header.flightDate)}`}
      author={header.operatorName}
      subject="Notification to captain"
    >
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.top}>
          <View style={styles.mark}>
            <Text style={styles.markText}>{header.flightNumber.slice(0, 2)}</Text>
          </View>
          <View style={styles.distribution}>
            <Text style={{ fontWeight: 700 }}>NOTOC DISTRIBUTION :</Text>
            <Text>1. Top Copy (white) : Captain</Text>
            <Text>2. Middle Copy (green) : Station File</Text>
            <Text>3. Bottom Copy (yellow) : Freight Agent</Text>
          </View>
          <Text style={styles.title}>NOTIFICATION TO CAPTAIN (NOTOC)</Text>
        </View>

        <View style={styles.boxes}>
          <Instructions operator={header.operatorName} />
          <Facts header={header} />
          <PreparationCertification header={header} />
        </View>

        <DangerousGoodsTable entries={notoc.document.dangerousGoods} dryIce={notoc.document.dryIce} />
        <SpecialLoadTable
          loads={notoc.document.specialLoads}
          coldChain={notoc.document.coldChain}
          preparedBy={header.preparedBy}
        />
        {notoc.document.specialPassengers.length > 0 && (
          <SpecialPassengerTable passengers={notoc.document.specialPassengers} />
        )}

        <View style={styles.bottom} wrap={false}>
          <CaptainAcceptance acceptance={acceptance} />
          <LoadingCertification header={header} />
        </View>

        <View style={styles.footer} fixed>
          <Text>
            {header.operatorName} · NOTOC {stage} · issued {dateToIcaoDate(issuedAt)} {dateToIcaoTime(issuedAt)} ·
            Emergency telephone {header.emergencyTelephone}
          </Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
